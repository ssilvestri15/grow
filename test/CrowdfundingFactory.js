// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingFactory", function () {
  let CrowdfundingFactory;
  let factory;

  beforeEach(async function () {
    // Get the CrowdfundingFactory contract
    CrowdfundingFactory = await ethers.getContractFactory( "CrowdfundingFactory");
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
    const target = ethers.parseEther("100");
    const duration = 100; //In giorni
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
  
  it("should revert if ether different than 0.2 ether", async function () {
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100; //In giorni
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

  it("should revert if the target is not greater than zero.", async function () {
    const title = "MyTitle";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = 0;
    const duration = 100;
    
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
    ).to.be.revertedWith("Target must be greater than 0.4 ether");
  });
  
  it("should revert if the duration is not at least one day.", async function () {
    const title = "MyTitle";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 0;
    
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
    ).to.be.revertedWith("Duration must be at least one day");
  });
  
  it("should revert if the title is empty.", async function () {
    const title = "";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100;
    
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
    ).to.be.revertedWith("Title must not be empty");
  });
  
  it("should revert if the description is empty.", async function () {
    const title = "MyTitle";
    const description = "";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100;
    
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
    ).to.be.revertedWith("Description must not be empty and be less or equal to 1000 characters");
  });
  
  it("should revert if the image poster URL is empty.", async function () {
    const title = "MyTitle";
    const description = "MyDescription";
    const urlImagePoster = "";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100;
    
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
    ).to.be.revertedWith("Image poster URL must not be empty");
  });
  
  it("should revert if the image banner URL is empty.", async function () {
    const title = "MyTitle";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100;
    
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
    ).to.be.revertedWith("Image banner URL must not be empty");
  });
  
  it("should revert if the NFT name is empty.", async function () {
    const title = "MyTitle";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100;
    
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
    ).to.be.revertedWith("NFT name must not be empty");
  });
  
  it("should revert if the NFT symbol is empty.", async function () {
    const title = "MyTitle";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "";
    const target = ethers.parseEther("100");
    const duration = 100;
    
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
    ).to.be.revertedWith("NFT symbol must not be empty");
  });

});
