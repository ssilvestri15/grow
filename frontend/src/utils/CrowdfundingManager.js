import { ethers } from "ethers";
import { getCrowdfundingFactoryAddress } from "./Repository"; 
import { getProvider } from "./Provider";
import { crowdfundingFactoryABI, campaignABI } from "../config/abiManager";

export async function createCampaign(title, description, imagePosterUrl, imageBannerUrl, nftName, nftSymbol, target, duration) {
  const [provider, signer] = await getProvider(false);
  if (!provider) {
    throw new Error("Provider not available");
  }
  const factoryAddress = getCrowdfundingFactoryAddress();
  if (factoryAddress === "") {
    throw new Error("Factory address not available");
  }
  console.log(factoryAddress);
  const userAddress = await getUserAddress();
  if (userAddress === null || userAddress === undefined) {
    throw new Error("MetaMask account not found");
  }
  const factory = new ethers.Contract(factoryAddress, crowdfundingFactoryABI, signer);
  try {
    const tx = await factory.createCampaign(title, description, imageBannerUrl, imagePosterUrl, nftName, nftSymbol, ethers.parseEther(target.toString()), duration, { value: ethers.parseEther("0.2") });
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.log(error);
    return "";
  }
}

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
        console.log(campaignInstance);
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

async function getUserAddress() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  if (accounts.length === 0) {
    return null;
  }
  return accounts[0];
}