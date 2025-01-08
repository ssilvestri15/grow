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

    // Fetch campaign data concurrently
    const [
      campaignTitle,
      campaignDescription,
      campaignBannerUrl,
      campaignPosterUrl,
      campaignStartDate,
      campaignTarget,
      campaignCurrentAmount,
      [myDonations, otherDonations],
    ] = await Promise.all([
      campaignInstance.title(),
      campaignInstance.description(),
      campaignInstance.imageBannerUrl(),
      campaignInstance.imagePosterUrl(),
      campaignInstance.startDate(),
      campaignInstance.targetAmount(),
      provider.getBalance(address),
      getDonationSummary(campaignInstance),
    ]);

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
    const donorAddress = await getUserAddress();
    const myDonationsPromise = donorAddress
      ? fetchTransactions(campaignInstance, donorAddress)
      : Promise.resolve([]);

    const donorAddresses = await campaignInstance.getDonorAddresses();
    const uniqueAddresses = Array.from(new Set(donorAddresses));
    const maxDonations = Math.min(uniqueAddresses.length, 10);

    const otherDonationsPromise = Promise.all(
      uniqueAddresses
        .filter(
          (address) =>
            !donorAddress ||
            address.trim().toUpperCase() !== donorAddress.trim().toUpperCase()
        )
        .slice(0, maxDonations)
        .map((address) =>
          fetchTransactions(campaignInstance, address).then((transactions) =>
            transactions.map((transaction) => ({
              donor: String(address),
              ...transaction,
            }))
          )
        )
    );

    const [myDonations, otherDonationsArray] = await Promise.all([
      myDonationsPromise,
      otherDonationsPromise,
    ]);

    return [myDonations, otherDonationsArray.flat()];
  } catch (error) {
    return [[], []];
  }
}

async function fetchTransactions(campaignInstance, donorAddress) {
  const donationArray = await campaignInstance.getUserDonations(donorAddress);
  return donationArray.map(([amount, timestamp]) => ({
    amount: ethers.formatEther(amount),
    timestamp: formatTimestamp(timestamp),
  }));
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
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
    return accounts?.[0] || null;
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
  if (!userAddress) {
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
