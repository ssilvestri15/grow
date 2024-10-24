// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingFactory", function () {
  let CrowdfundingFactory;
  let factory;

  beforeEach(async function () {
    // Get the CrowdfundingFactory contract
    CrowdfundingFactory = await ethers.getContractFactory(  "CrowdfundingFactory");
    // Deploy the CrowdfundingFactory contract
    factory = await CrowdfundingFactory.deploy();
  });

  it("should create a Campaign contract", async function () {
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = 100;
    const duration = 100;
    // Check that the event was emitted
    await expect(
      factory.createCampaign(
        title,
        description,
        urlImagePoster,
        urlImageBanner,
        nftName,
        nftSymbol,
        target,
        duration,
        { value: ethers.parseEther("0.2") }
      )
    ).to.emit(factory, "CampaignCreated").withArgs(title);
  });
  
  it("should create a Campaign contract", async function () {
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = 100;
    const duration = 100;
    // Check that the event was emitted
    await expect(
      factory.createCampaign(
        title,
        description,
        urlImagePoster,
        urlImageBanner,
        nftName,
        nftSymbol,
        target,
        duration
      )
    ).to.be.revertedWith("You need to send exactly 0.2 Ether to create a campaign");
  });
});
