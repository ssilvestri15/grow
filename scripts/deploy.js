const hre = require("hardhat");
const campaignList = require("./campaignlist");
const fs = require("fs");
const path = require("path");
const { getWifiIp } = require("./wifi");

async function createCampaign(owner, factory, config) {
  const {
    title,
    description,
    urlImageBanner,
    urlImagePoster,
    nftName,
    nftSymbol,
    target,
    duration,
  } = config;

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

    logBoxedMessage(`Campaign Created: ${title}`);
    console.log(`Address: ${campaignAddress}`);
    console.log(`Owner: ${owner.address}`);
  } catch (error) {
    printCustomError(`Error Creating Campaign: ${title}`, error);
  }
}

function logBoxedMessage(message) {
  console.log(createBoxedMessage(message));
}

function createBoxedMessage(title) {
  const padding = 10;
  const border = "#".repeat(title.length + padding * 2);
  const paddedTitle = `${"#".repeat(padding - 1)} ${title} ${"#".repeat(padding - 1)}`;
  return `${border}\n${paddedTitle}\n${border}`;
}

function printCustomError(title, error) {
  console.error(createBoxedMessage(title));
  const errorMessage = error.message || String(error);
  console.error(errorMessage.split("\n").map((line) => `> ${line}`).join("\n"));
  console.error("#".repeat(title.length + 20));
}

function updateEnvFile(filePath, keyValues) {
  try {
    let envData = "";
    if (fs.existsSync(filePath)) {
      envData = fs.readFileSync(filePath, "utf8");
    }
    const updatedData = { ...parseEnvData(envData), ...keyValues };
    const newContent = Object.entries(updatedData)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    fs.writeFileSync(filePath, newContent);
    console.log(`Environment file updated: ${filePath}`);
  } catch (error) {
    console.error(`Failed to update environment file: ${filePath}`, error);
  }
}

function parseEnvData(data) {
  return data.split("\n").reduce((acc, line) => {
    const [key, value] = line.split("=");
    if (key) acc[key.trim()] = value.trim();
    return acc;
  }, {});
}

async function main() {
  try {
    const { os, ip } = getWifiIp();
    const envFilePath = path.resolve(__dirname, "../frontend/.env");

    const signers = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", signers[0].address);

    const CrowdfundingFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
    const crowdfundingFactory = await CrowdfundingFactory.deploy();
    await crowdfundingFactory.waitForDeployment();

    const factoryAddress = await crowdfundingFactory.getAddress();
    console.log("Crowdfunding Factory deployed to:", factoryAddress);

    updateEnvFile(envFilePath, {
      REACT_APP_WIFI_IP: ip,
      REACT_APP_OS: os,
      REACT_APP_CROWDFUNDING_FACTORY: factoryAddress,
    });

    const campaignEntries = Object.entries(campaignList);
    const campaignPromises = campaignEntries.map(([name, config], index) =>
      createCampaign(signers[index + 1], crowdfundingFactory, config).catch((error) =>
        printCustomError(`Error Deploying Campaign: ${name}`, error)
      )
    );

    await Promise.all(campaignPromises);

    logBoxedMessage("All campaigns deployed successfully.");
  } catch (error) {
    printCustomError("Deployment Failed", error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));