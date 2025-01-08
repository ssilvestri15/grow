import { ethers } from "ethers";
import { getCrowdfundingFactoryAddress } from "./Repository";
import { getProvider } from "./Provider";
import { crowdfundingFactoryABI, campaignABI } from "../config/abiManager";

export async function createCampaign(
  title,
  description,
  imagePosterUrl,
  imageBannerUrl,
  nftName,
  nftSymbol,
  target,
  duration
) {
  const [provider, signer] = await getProvider(false);
  if (!provider) {
    throw new Error("Provider not available");
  }

  const factoryAddress = getCrowdfundingFactoryAddress();
  if (!factoryAddress) {
    throw new Error("Factory address not available");
  }

  const userAddress = await getUserAddress();
  if (!userAddress) {
    throw new Error("MetaMask account not found");
  }

  const factory = new ethers.Contract(
    factoryAddress,
    crowdfundingFactoryABI,
    signer
  );

  try {
    const tx = await factory.createCampaign(
      title,
      description,
      imageBannerUrl,
      imagePosterUrl,
      nftName,
      nftSymbol,
      ethers.parseEther(target.toString()),
      duration,
      { value: ethers.parseEther("0.2") }
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export async function getCampaigns() {
  const factoryAddress = getCrowdfundingFactoryAddress();
  if (!factoryAddress) {
    console.error("Factory address not available");
    return [];
  }

  const [provider] = await getProvider();
  if (!provider) {
    console.error("Provider not available");
    return [];
  }

  const factory = new ethers.Contract(
    factoryAddress,
    crowdfundingFactoryABI,
    provider
  );

  try {
    const campaigns = await factory.getCampaigns();
    const campaignDetailsPromises = campaigns.map(async (campaignAddress) => {
      try {
        const campaignInstance = new ethers.Contract(
          campaignAddress,
          campaignABI,
          provider
        );

        // Fetch campaign details concurrently
        const [
          title,
          description,
          bannerUrl,
          posterUrl,
          startDate,
        ] = await Promise.all([
          campaignInstance.title(),
          campaignInstance.description(),
          campaignInstance.imageBannerUrl(),
          campaignInstance.imagePosterUrl(),
          campaignInstance.startDate(),
        ]);

        return {
          address: campaignAddress,
          title,
          description,
          bannerUrl,
          posterUrl,
          startDate: formatTimestamp(startDate),
        };
      } catch (error) {
        console.error(`Failed to fetch details for ${campaignAddress}`, error);
        return null; // Skip invalid campaigns
      }
    });

    const campaignsDetails = await Promise.all(campaignDetailsPromises);
    return campaignsDetails.filter(Boolean); // Remove null values
  } catch (error) {
    console.error(error);
    return [];
  }
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
    return accounts[0] || null;
  } catch (error) {
    console.error("Failed to get user address", error);
    return null;
  }
}
