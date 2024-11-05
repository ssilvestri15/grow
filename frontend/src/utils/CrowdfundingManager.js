import { ethers } from "ethers";
import { getCrowdfundingFactoryAddress } from "./Repository"; 
import { getProvider } from "./Provider";
import { crowdfundingFactoryABI, campaignABI } from "../config/abiManager";

export async function getCampaigns() {
  let campaignsDetails = [];
  const factoryAddress = getCrowdfundingFactoryAddress();
  if (factoryAddress === "") {
    console.log("Factory address not available");
    return [];
  }
  const [provider, signer] = await getProvider();
  if (!provider) {
    console.log("Provider not available");
    return [];
  }
  const factory = new ethers.Contract(factoryAddress, crowdfundingFactoryABI, provider);
  try {
    const campaigns = await factory.getCampaigns();
    console.log(campaigns);
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
        console.log(error);
        continue;
      }
    }
  } catch (error) {
    console.log(error);
    campaignsDetails = [];
  }

  return campaignsDetails;
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // Conversione a Number
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}