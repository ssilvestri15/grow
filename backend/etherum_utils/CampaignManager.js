const { getBackendProvider, getCrowdfundingFactoryAddress } = require("./utils.js");
const ethers = require("ethers");
const { crowdfundingFactoryABI, campaignABI } = require("../config/abiManager.js");

async function getCampaignDetails(campaignAddress) {
  let campaignDetails = {};
  const provider = await getBackendProvider();
  if (!provider) {
    return {};
  }
  const campaignInstance = new ethers.Contract(campaignAddress, campaignABI, provider);
  try {
    const campaignTitle = await campaignInstance.title();
    const campaignDescription = await campaignInstance.description();
    const campaignBannerUrl = await campaignInstance.imageBannerUrl();
    const campaignPosterUrl = await campaignInstance.imagePosterUrl();
    const campaignStartDate = await campaignInstance.startDate();
    const campaignTarget = await campaignInstance.targetAmount();
    const campaignCurrentAmount = await campaignInstance.currentAmount();
    const [myDonations, otherDonations] = await getDonationSummary(campaignInstance);
    campaignDetails = {
      address: campaignAddress,
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
    return campaignDetails;
  } catch (error) {
    console.log(error);
    return {};
  }
}

async function getDonationSummary(campaignInstance, userAddress = null) {
  try {
    const myDonations = [];
    const otherDonations = [];
    const donorAddress = userAddress;
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
      if (donorAddress && String(othersDonatorAddress[i]).trim().toUpperCase() === String(donorAddress).trim().toUpperCase()) {
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

async function getCampaigns() {
  const campaignsDetails = [];
  const provider = await getBackendProvider();
  if (!provider) {
    return [];
  }
  const factoryAddress = getCrowdfundingFactoryAddress();
  if (factoryAddress === "") {
    return [];
  }
  const factory = new ethers.Contract(factoryAddress, crowdfundingFactoryABI, provider);
  try {
    const campaigns = await factory.getCampaigns();
    for (let index in campaigns) {
      try {
        const campaignInstance = new ethers.Contract(campaigns[index], campaignABI, provider);
        const campaignTitle = await campaignInstance.title();
        const campaignDescription = await campaignInstance.description();
        const campaignBannerUrl = await campaignInstance.imageBannerUrl();
        const campaignPosterUrl = await campaignInstance.imagePosterUrl();
        const campaignStartDate = await campaignInstance.startDate();
        const campaignDetails = {
          address: campaigns[index],
          title: campaignTitle,
          description: campaignDescription,
          bannerUrl: campaignBannerUrl,
          posterUrl: campaignPosterUrl,
          startDate: formatTimestamp(campaignStartDate),
        };
        campaignsDetails.push(campaignDetails);
      } catch (error) {
        continue;
      }
    }
    return campaignsDetails;
  } catch (error) {
    return [];
  }
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // Conversione a Number
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

module.exports = { getCampaigns, getCampaignDetails};