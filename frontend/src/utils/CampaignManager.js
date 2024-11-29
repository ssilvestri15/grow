import { ethers } from "ethers";
import { getProvider } from "./Provider";
import { campaignABI } from "../config/abiManager";

export async function getCampaign(address) {
  let campaignDetails = {};
  const [provider, signer] = await getProvider();
  if (!provider) {
    return {};
  }
  try {
    const campaignInstance = new ethers.Contract(
      address,
      campaignABI,
      provider
    );
    const campaignTitle = await campaignInstance.title();
    const campaignDescription = await campaignInstance.description();
    const campaignBannerUrl = await campaignInstance.imageBannerUrl();
    const campaignPosterUrl = await campaignInstance.imagePosterUrl();
    const campaignStartDate = await campaignInstance.startDate();
    const campaignTarget = await campaignInstance.targetAmount();
    const campaignCurrentAmount = await provider.getBalance(address);
    const [myDonations, otherDonations] = await getDonationSummary(
      campaignInstance
    );
    campaignDetails = {
      address: address,
      title: campaignTitle,
      description: campaignDescription,
      bannerUrl: campaignPosterUrl,
      posterUrl: campaignBannerUrl,
      startDate: formatTimestamp(campaignStartDate),
      target: ethers.formatEther(campaignTarget),
      currentAmount: ethers.formatEther(campaignCurrentAmount),
      myDonations: myDonations,
      otherDonations: otherDonations,
    };
  } catch (error) {
    campaignDetails = {};
  }

  return campaignDetails;
}

async function getDonationSummary(campaignInstance) {
  try {
    let myDonations = [];
    let otherDonations = [];
    const donorAddress = await getUserAddress();
    if (donorAddress === null || donorAddress === undefined) {
      myDonations = [];
    }
    if (donorAddress) {
      await fetchTransactions(campaignInstance, donorAddress, (amount, timestamp) => {
        myDonations.push({
          donor: donorAddress,
          amount: ethers.formatEther(amount),
          timestamp: formatTimestamp(timestamp),
        });
      });
    }
    const donorAddresses = await campaignInstance.getDonorAddresses();
    const uniqueAddresses = Array.from(new Set(donorAddresses)); // Remove duplicates and convert to array
    const maxDonations = Math.min(uniqueAddresses.length, 10);
    let processedDonations = 0;
    for (const address of uniqueAddresses) {
      if (processedDonations >= maxDonations) break;
      if (donorAddress && address.trim().toUpperCase() === donorAddress.trim().toUpperCase()) {
        continue;
      }
      await fetchTransactions(campaignInstance, address, (amount, timestamp) => {
        otherDonations.push({
          donor: String(address),
          amount: ethers.formatEther(amount),
          timestamp: formatTimestamp(timestamp),
        });
        processedDonations++;
      });
    }
    return [myDonations, otherDonations];
  } catch (error) {
    return [[], []];
  }
}

async function fetchTransactions(campaignInstance, donorAddress, doThing) {
  const donationArray = await campaignInstance.getUserDonations(donorAddress);
  donationArray.forEach((donation) => {
    const [amount, timestamp] = donation;
    doThing(amount, timestamp);
  });  
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // Conversione a Number
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function getUserAddress() {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts === null || accounts === undefined || accounts.length === 0) {
      return null;
    }
    return accounts[0];
  } catch (error) {
    return null;
  }
}

export async function donate(address, amount) {
  const [provider, signer] = await getProvider(false);
  if (!provider) {
    throw new Error("Provider not available");
  }
  const userAddress = await getUserAddress();
  if (userAddress === null || userAddress === undefined) {
    throw new Error("MetaMask account not found");
  }
  try {
    const campaignInstance = new ethers.Contract(address, campaignABI, signer);
    const donationAmount = ethers.parseEther(amount);
    const txResponse = await campaignInstance.donate({
      value: donationAmount,
    });
    await txResponse.wait();
    return true;
  } catch (error) {
    return false;
  }
}
