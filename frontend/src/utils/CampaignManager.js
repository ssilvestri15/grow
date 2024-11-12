import { ethers } from "ethers";
import { getProvider } from "./Provider";
import { campaignABI } from "../config/abiManager";

export async function getCampaign(address) {
  let campaignDetails = {};
  const [provider, signer] = await getProvider();
  if (!provider) {
    console.log("Provider not available");
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
    const campaignCurrentAmount = await campaignInstance.currentAmount();
    const [myDonations, otherDonations] = await getDonationSummary(
      campaignInstance
    );
    console.log(myDonations);
    console.log(otherDonations);
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
    console.log(campaignDetails);
  } catch (error) {
    console.log(error);
    campaignDetails = {};
  }

  return campaignDetails;
}

async function getDonationSummary(campaignInstance) {
  try {
    const myDonations = [];
    const otherDonations = [];
    const donorAddress = await getUserAddress();
    if (donorAddress === null || donorAddress === undefined) {
      myDonations = [];
    }
    if (donorAddress) {
      await fetchTransactions(campaignInstance, donorAddress, (donor, amount, timestamp) => {
        myDonations.push({
          donor: donor,
          amount: ethers.formatEther(amount),
          timestamp: formatTimestamp(timestamp),
        });
      });
    }
    const othersDonatorAddress = await campaignInstance.getDonorAddresses();
    const limit = Math.min(othersDonatorAddress.length, 10);
    for (let i = 0; i < limit; i++) {
      if (String(othersDonatorAddress[i]).trim().toUpperCase() === String(donorAddress).trim().toUpperCase()) {
        continue;
      }
      await fetchTransactions(campaignInstance, othersDonatorAddress[i], (donor, amount, timestamp) => {
        otherDonations.push({
          donor: donor,
          amount: ethers.formatEther(amount),
          timestamp: formatTimestamp(timestamp),
        });
      });
    }
    return [myDonations, otherDonations];
  } catch {
    return [[], []];
  }
}

async function fetchTransactions(campaignInstance, donorAddress, doThing) {
  const donationArray = await campaignInstance.getUserDonations(donorAddress);
  donationArray.forEach((donation) => {
    const [donor, amount, timestamp] = donation;
    doThing(donor, amount, timestamp);
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
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  if (accounts.length === 0) {
    return null;
  }
  return accounts[0];
}

export async function donate(address, amount) {
  const [provider, signer] = await getProvider();
  if (!provider) {
    console.log("Provider not available");
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
    console.log(`Donation of ${amount} ETH sent to ${address}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
