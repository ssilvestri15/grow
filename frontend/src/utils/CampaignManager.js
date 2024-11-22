import { ethers } from "ethers";
import { getProvider } from "./Provider";
import { campaignABI } from "../config/abiManager";

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
