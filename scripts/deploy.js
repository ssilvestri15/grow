const hre = require("hardhat");
const { smarthomeai, ecobattery, quantumwallet, aihealthcare, smartcitygrid, agritechAI, edtechAI, cleanairTech, ecoWater, recycleBot } = require("./campaignlist");
const fs = require('fs');
const path = require('path');
const { getWifiIp } = require('./wifi');

async function createCampaign(owner, factory, {
  title,
  description,
  urlImageBanner,
  urlImagePoster,
  nftName,
  nftSymbol,
  target,
  duration,
}) {
  const asyncampaign = await factory.connect(owner).createCampaign(
    title,
    description,
    urlImageBanner,
    urlImagePoster,
    nftName,
    nftSymbol,
    target,
    duration,
    { value: ethers.parseEther("0.2") }
  );
  await asyncampaign.wait();
  const lenght = (await factory.getCampaigns()).length;
  const campaign = await hre.ethers.getContractAt("Campaign", (await factory.getCampaigns())[lenght - 1]);
  console.log(`\n#############################################################################################`);
  console.log(`Campaign: ${title}`);
  console.log(`Address: ${await campaign.getAddress()}`);
  console.log(`Owner: ${owner.address}`);
  console.log(`#############################################################################################\n`);
}

function createBoxedMessage(title) {
  // Determine the length of the border based on title length
  const titleLength = title.length;
  const padding = 10; // adjust padding if needed
  const borderLength = titleLength + padding * 2;

  // Generate the border and message
  const border = "#".repeat(borderLength);
  const paddedTitle = `${"#".repeat(padding-1)} ${title} ${"#".repeat(padding-1)}`;

  const msg = `
${border}
${paddedTitle}
${border}
`;
  return msg;
}

function printCustomError(title, error) {
  const header = createBoxedMessage(title);
  const footer = "#".repeat(header.length);
  console.error(header);
  console.error(error);
  console.error(footer);
}

async function main() {

  //Save ip to env
  const wifiIp = getWifiIp();
  const envIp = `REACT_APP_WIFI_IP=${wifiIp}`;
  const envFilePathIp = path.resolve(__dirname, '../frontend/.env');
  try {
    fs.writeFileSync(envFilePathIp, envIp);
    console.log(`Updated ip in ${envFilePathIp}`);  
  } catch (err) {
    console.error(err);
  }


  // Ottieni l'account del deployer
  const [deployer, owner, owner2, owner3, owner4, owner5, owner6, owner7, owner8, owner9, owner10] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy della Crowdfunding Factory
  const CrowdfundingFactory = await hre.ethers.getContractFactory("CrowdfundingFactory");
  const crowdfundingFactory = await CrowdfundingFactory.deploy();
  await crowdfundingFactory.waitForDeployment();
  const factoryAddress = await crowdfundingFactory.getAddress();
  console.log("Crowdfunding Factory deployed to:", factoryAddress);

  // Salva l'indirizzo della Crowdfunding Factory
  const addressesFilePath = path.resolve(__dirname, '../frontend/src/config/contractAddresses.json');
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync(addressesFilePath, 'utf8'));
  } catch (err) {
    addresses = {};
  }

  const network = hre.network.name;
  addresses[network] = {
    "crowdfundingFactory": factoryAddress
  };

  try {
    fs.writeFileSync(addressesFilePath, JSON.stringify(addresses, null, 2));
    console.log(`Updated contract addresses in ${addressesFilePath}`);  
  } catch (err) {
    console.error(err);
  }

  const envFilePath = path.resolve(__dirname, '../backend/.env');
  const stringToEnv = `CROWDFUNDING_FACTORY_ADDRESS=${factoryAddress}`;
  try {
    fs.writeFileSync(envFilePath, stringToEnv);
    console.log(`Updated contract addresses in ${envFilePath}`);  
  } catch (err) {
    console.error(err);
  }

  // Deploy delle campagne e controllo errori
  await createCampaign(owner, crowdfundingFactory, smarthomeai).catch((error) => printCustomError("SmartHomeAI", error));
  await createCampaign(owner2, crowdfundingFactory, ecobattery).catch((error) => printCustomError("EcoBattery", error));
  await createCampaign(owner3, crowdfundingFactory, quantumwallet).catch((error) => printCustomError("QuantumWallet", error));
  await createCampaign(owner4, crowdfundingFactory, aihealthcare).catch((error) => printCustomError("AIHealthcare", error));
  await createCampaign(owner5, crowdfundingFactory, smartcitygrid).catch((error) => printCustomError("SmartCityGrid", error));
  await createCampaign(owner6, crowdfundingFactory, agritechAI).catch((error) => printCustomError("AgriTechAI", error));
  await createCampaign(owner7, crowdfundingFactory, edtechAI).catch((error) => printCustomError("EdTechAI", error));
  await createCampaign(owner8, crowdfundingFactory, cleanairTech).catch((error) => printCustomError("CleanAirTech", error));
  await createCampaign(owner9, crowdfundingFactory, ecoWater).catch((error) => printCustomError("EcoWater", error));
  await createCampaign(owner10, crowdfundingFactory, recycleBot).catch((error) => printCustomError("RecycleBot", error));
}
// Avvia il processo di deploy
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
