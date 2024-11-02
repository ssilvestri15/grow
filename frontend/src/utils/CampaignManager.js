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
    const campaignCurrentAmount = await campaignInstance.currentAmount();
    campaignDetails = {
      address: address,
      title: campaignTitle,
      description: campaignDescription,
      bannerUrl: campaignPosterUrl,
      posterUrl: campaignBannerUrl,
      startDate: formatTimestamp(campaignStartDate),
      target: 0,
      currentAmount: ethers.formatEther(campaignCurrentAmount),
    };
    console.log(campaignDetails);
  } catch (error) {
    console.log(error);
    campaignDetails = {};
  }

  return campaignDetails;
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // Conversione a Number
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
