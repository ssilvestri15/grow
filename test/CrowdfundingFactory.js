// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingFactory", function () {
  let CrowdfundingFactory;
  let factory;

  beforeEach(async function () {
    // Get the CrowdfundingFactory contract
    CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    // Deploy the CrowdfundingFactory contract
    factory = await CrowdfundingFactory.deploy();
    await factory.waitForDeployment();
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
        nftName,
        nftSymbol,
        target,
        duration
      )
    ).to.be.revertedWith("You need to send exactly 0.2 Ether to create a campaign");
  });

  it("should revert if the target is not greater than 0.4.", async function () {
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
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
        urlImageBanner,
        urlImagePoster,
        nftName,
        nftSymbol,
        target,
        duration,
        { value: ethers.parseEther("0.2") }
      )
    ).to.be.revertedWith("NFT symbol must not be empty");
  });

  it("should be able to get campaign", async function () {
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 100; //In giorni
    // Check that the event was emitted
    await factory.createCampaign(
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

    const campaigns = await factory.getCampaigns();
    expect(campaigns.length).to.equal(1);
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);
    expect(await campaign.title()).to.equal(title);
  });

  it("should be able to withdraw funds", async function () {
    const [_, owner, donor] = await ethers.getSigners();
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("1");
    const duration = 1; //In giorni
    // Check that the event was emitted
    await factory.connect(owner).createCampaign(
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
    const campaigns = await factory.getCampaigns();
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);
    await campaign.connect(donor).donate({ value: ethers.parseEther("5") });
    await ethers.provider.send("evm_increaseTime", [2*86400]); // add 1 day seconds
    await expect(
      factory.connect(owner).withdrawFunds(campaign.getAddress(), {value: ethers.parseEther("0.2")})
    ).to.emit(campaign, "FundsWithdrawn").withArgs(owner.address, ethers.parseEther("5"));
  });

  it("should revert if not owner", async function () {
    const [_, owner, donor] = await ethers.getSigners();
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 1; //In giorni
    // Check that the event was emitted
    await factory.connect(owner).createCampaign(
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
    const campaigns = await factory.getCampaigns();
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);
    await expect(
      factory.connect(donor).withdrawFunds(campaign.getAddress(), {value: ethers.parseEther("0.2")})
    ).to.revertedWith("You are not the owner of this campaign");
  });

  it("should revert if value is not 0.2 ether", async function () {
    const [_, owner, donor] = await ethers.getSigners();
    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("100");
    const duration = 1; //In giorni
    // Check that the event was emitted
    await factory.connect(owner).createCampaign(
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
    const campaigns = await factory.getCampaigns();
    const campaign = await ethers.getContractAt("Campaign", campaigns[0]);
    await expect(
      factory.connect(owner).withdrawFunds(campaign.getAddress(), {value: ethers.parseEther("5")})
    ).to.revertedWith("You need to send exactly 0.2 Ether to withdraw funds");
  });

});
