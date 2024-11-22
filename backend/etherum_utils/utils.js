const { ethers } = require("ethers");

async function getBackendProvider() {
  try {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    return provider;
  } catch (error) {
    return null;
  }
}

function getCrowdfundingFactoryAddress() {
  return process.env.CROWDFUNDING_FACTORY_ADDRESS;
}

module.exports = { getBackendProvider, getCrowdfundingFactoryAddress };
