const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  // Ottieni l'account del deployer
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  
  // Ottieni il saldo dell'account del deployer
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy della NFT Factory
  const NFTFactory = await hre.ethers.getContractFactory("NFTFactory");
  const nftFactory = await NFTFactory.deploy();
  console.log("NFT Factory deployed to:", nftFactory.address);

  // Deploy della Crowdfunding Factory
  const CrowdfundingFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
  const crowdfundingFactory = await CrowdfundingFactory.deploy();
  console.log("Crowdfunding Factory deployed to:", crowdfundingFactory.address);

  // Mostra il saldo rimanente dopo il deploy
  const remainingBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Remaining balance after deploy:", remainingBalance);
}

// Avvia il processo di deploy
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
