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
    const [myDonations, otherDonations] = await getDonationSummary();
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
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts.length === 0) {
      myDonations = [];
    }
    const donorAddress = accounts[0];
    if (donorAddress) {
      const donationArray = await campaignInstance.getUserDonations(
        donorAddress
      );
      donationArray.forEach((donation) => {
        const [donor, amount, timestamp] = donation;
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
      if (othersDonatorAddress[i] === donorAddress) {
        continue;
      }
      const donationArray = await campaignInstance.getUserDonations(
        donorAddress
      );
      donationArray.forEach((donation) => {
        const [donor, amount, timestamp] = donation;
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

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // Conversione a Number
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
