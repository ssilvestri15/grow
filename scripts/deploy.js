const hre = require("hardhat");
const campaignList = require("./campaignlist");
const fs = require("fs");
const path = require("path");
const { getWifiIp } = require("./wifi");

async function createCampaign(owner, factory, campaignConfig) {
  const {
    title,
    description,
    urlImageBanner,
    urlImagePoster,
    nftName,
    nftSymbol,
    target,
    duration,
  } = campaignConfig;

  try {
    const tx = await factory.connect(owner).createCampaign(
      title,
      description,
      urlImageBanner,
      urlImagePoster,
      nftName,
      nftSymbol,
      target,
      duration,
      { value: hre.ethers.parseEther("0.2") }
    );
    await tx.wait();

    const campaigns = await factory.getCampaigns();
    const campaignAddress = campaigns[campaigns.length - 1];
    const campaign = await hre.ethers.getContractAt("Campaign", campaignAddress);

    console.log(`\n${createBoxedMessage(`Campaign Created: ${title}`)}`);
    console.log(`Address: ${campaignAddress}`);
    console.log(`Owner: ${owner.address}`);
  } catch (error) {
    printCustomError(`Error Creating Campaign: ${title}`, error);
  }
}

function createBoxedMessage(title) {
  const padding = 10;
  const border = "#".repeat(title.length + padding * 2);
  const paddedTitle = `${"#".repeat(padding - 1)} ${title} ${"#".repeat(padding - 1)}`;
  return `${border}\n${paddedTitle}\n${border}`;
}

function printCustomError(title, error) {
  console.error(createBoxedMessage(title));
  console.error(error.message || error);
  console.error("#".repeat(title.length + 20));
}

function saveToFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, data);
    console.log(`Updated file: ${filePath}`);
  } catch (error) {
    console.error(`Failed to write to ${filePath}`, error);
  }
}

async function main() {
  // Save IP to .env
  const wifiIp = getWifiIp();
  const envFilePath = path.resolve(__dirname, "../frontend/.env");
  saveToFile(envFilePath, `REACT_APP_WIFI_IP=${wifiIp}`);

  // Get signers
  const signers = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", signers[0].address);

  // Deploy Crowdfunding Factory
  const CrowdfundingFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
  const crowdfundingFactory = await CrowdfundingFactory.deploy();
  await crowdfundingFactory.waitForDeployment();

  const factoryAddress = await crowdfundingFactory.getAddress();
  console.log("Crowdfunding Factory deployed to:", factoryAddress);

  // Save contract addresses
  const addressesFilePath = path.resolve(__dirname, "../frontend/src/config/contractAddresses.json");
  let addresses = {};
  try {
    addresses = JSON.parse(fs.readFileSync(addressesFilePath, "utf8"));
  } catch (error) {
    console.warn("No existing contract addresses file found. Creating a new one.");
  }
  addresses[hre.network.name] = { crowdfundingFactory: factoryAddress };
  saveToFile(addressesFilePath, JSON.stringify(addresses, null, 2));

  // Deploy campaigns
  const campaignEntries = Object.entries(campaignList);
  const campaignPromises = campaignEntries.map(([campaignName, campaignConfig], index) =>
    createCampaign(signers[index + 1], crowdfundingFactory, campaignConfig).catch((error) =>
      printCustomError(`Error Deploying Campaign: ${campaignName}`, error)
    )
  );
  await Promise.all(campaignPromises);

  console.log("All campaigns deployed successfully.");
}

// Start the deployment process
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
