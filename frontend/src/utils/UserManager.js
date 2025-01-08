import { ethers } from "ethers";
import { getProvider } from "./Provider";
import { getCrowdfundingFactoryAddress } from "./Repository";
import { campaignABI, crowdfundingFactoryABI, nftABI } from "../config/abiManager";

export async function getUserData() {
  const factoryAddress = getCrowdfundingFactoryAddress();
  if (!factoryAddress) {
    console.error("Factory address not available");
    return { campaignsOwned: [], userContributions: [], userTokens: [] };
  }

  const [provider, signer] = await getProvider();
  if (!provider) {
    console.error("Provider not available");
    return { campaignsOwned: [], userContributions: [], userTokens: [] };
  }

  const userAddress = await getUserAddress();
  if (!userAddress) {
    throw new Error("MetaMask account not found");
  }

  const factory = new ethers.Contract(factoryAddress, crowdfundingFactoryABI, provider);
  
  try {
    const campaigns = await factory.getCampaigns();
    const results = await Promise.allSettled(
      campaigns.map((campaignAddress) => processCampaign(campaignAddress, userAddress, provider))
    );

    const campaignsOwned = [];
    const userContributions = [];
    const userTokens = [];

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { owned, contributions, tokens } = result.value;
        if (owned) campaignsOwned.push(owned);
        if (contributions.length) userContributions.push(...contributions);
        if (tokens) userTokens.push(tokens);
      }
    });

    return { campaignsOwned, userContributions, userTokens };
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return { campaignsOwned: [], userContributions: [], userTokens: [] };
  }
}

async function processCampaign(campaignAddress, userAddress, provider) {
  try {
    const campaignInstance = new ethers.Contract(campaignAddress, campaignABI, provider);
    const [campaignOwner, title, bannerUrl, posterUrl] = await Promise.all([
      campaignInstance.owner(),
      campaignInstance.title(),
      campaignInstance.imageBannerUrl(),
      campaignInstance.imagePosterUrl(),
    ]);

    if (campaignOwner.toLowerCase() === userAddress.toLowerCase()) {
      return {
        owned: { address: campaignAddress, title, bannerUrl, posterUrl },
        contributions: [],
        tokens: null,
      };
    }

    const contributions = await getUserContributions(userAddress, title, campaignAddress, campaignInstance);
    const tokens =
      contributions.length > 0
        ? {
            token: await getUserToken(userAddress, campaignInstance, provider),
            title: title,
        }
        : null;
    return { owned: null, contributions, tokens };
  } catch (error) {
    console.warn(`Error processing campaign at ${campaignAddress}:`, error);
    return { owned: null, contributions: [], tokens: null };
  }
}

async function getUserToken(userAddress, campaignInstance, provider) {
  const nftContractAddress = await campaignInstance.getNftContract();
  const nftContract = new ethers.Contract(nftContractAddress, nftABI, provider);
  return nftContract.getNFTToken(userAddress);
}

async function getUserContributions(userAddress, title, address, campaignInstance) {
  try {
    const donations = await campaignInstance.getUserDonations(userAddress);
    return donations.map(([amount, timestamp]) => ({
      title: title,
      address: address,
      donor: String(userAddress),
      amount: ethers.formatEther(amount),
      timestamp: formatTimestamp(timestamp),
    }));
  } catch (error) {
    console.warn("Error fetching user contributions:", error);
    return [];
  }
}

async function getUserAddress() {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts.length ? accounts[0] : null;
}

function formatTimestamp(timestamp) {
  const date = new Date(Number(timestamp) * 1000); // Conversione a Number
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
