// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campaign", function () {
  
    let factory;
    let campaign;
    let donor;
    let owner;

  beforeEach(async function () {


    [owner, donor] = await ethers.getSigners();

    // Deploy the CrowdfundingFactory contract
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    factory = await CrowdfundingFactory.deploy();
    await factory.waitForDeployment();

    const title = "MyCampaign";
    const description = "MyDescription";
    const urlImagePoster = "MyUrlImagePoster";
    const urlImageBanner = "MyUrlImageBanner";
    const nftName = "MyNFT";
    const nftSymbol = "MNFT";
    const target = ethers.parseEther("1");
    const duration = 1;

    // Create a campaign and await the transaction
    const asyncCampaign = await factory.createCampaign(
      title,
      description,
      urlImagePoster,
      urlImageBanner,
      nftName,
      nftSymbol,
      target,
      duration,
      { value: ethers.parseEther("0.2") }
    );
    await asyncCampaign.wait();

    // Retrieve campaigns
    const campaigns = await factory.getCampaigns();
    expect(campaigns.length).to.equal(1); // Ensure the campaign was created

    // Get the Campaign contract instance
    campaign = await ethers.getContractAt("Campaign", campaigns[0]);
  });

  it("should interact with the campaign instance", async function () {
    // Test interactions with the campaign
    const campaignTitle = await campaign.title();
    expect(campaignTitle).to.equal("MyCampaign");
  });

  /* 
  ######################################################
  ###################### DONATION ######################
  ######################################################
  */
  it("should revert if the donation amount is zero.", async function () {
    // Assicura che venga emesso un errore se la donazione è zero
    await expect(
      campaign.connect(donor).donate({ value: 0 })
    ).to.be.revertedWith("Donation must be greater than zero");
  });

  it("should revert if the campaign is closed.", async function () {
    // Chiudere la campagna prima del test
    await ethers.provider.send("evm_increaseTime", [2*86400]) // add 1 day seconds

    // Assicura che venga emesso un errore se la campagna è chiusa
    await expect(
      campaign.connect(donor).donate({ value: ethers.parseEther("1") })
    ).to.be.revertedWith("The campaign is closed");
  });

  it("should allow a donation", async function () {
    const donationAmount = ethers.parseEther("1");

    // Donazione iniziale
    await expect(campaign.connect(donor).donate({ value: donationAmount }))
    .to.emit(campaign, "Donated")
    .withArgs(donor.address, donationAmount);
    
  });

  it("should mint an NFT if donate for the first time", async function () {
    const donationAmount = ethers.parseEther("1");
    const nftAddress = await campaign.getNftContract();
    const nftContract = await ethers.getContractAt("NFT", nftAddress);


    await expect(campaign.connect(donor).donate({ value: donationAmount }))
    .to.emit(nftContract, "Minted");
  });

  it("should update balance and emit Donated event on successful donation.", async function () {
    const donationAmount = ethers.parseEther("1");
    const balance = await ethers.provider.getBalance(campaign.getAddress());
    // Controlla che l’evento Donated sia emesso con i dati corretti
    await expect(
      campaign.connect(donor).donate({ value: donationAmount })
    )
      .to.emit(campaign, "Donated")
      .withArgs(donor.address, donationAmount);

    // Controlla che currentAmount sia stato aggiornato
    const currentBalance = await ethers.provider.getBalance(campaign.getAddress());
    const diff = currentBalance - balance;
    expect(diff).to.equal(donationAmount);
  });

    
  /* 
  ###########################################################
  ###################### withdrawFunds ######################
  ###########################################################
  */
  it("should allow the owner to withdraw the funds after the campaign is closed.", async function () {
    const tax = ethers.parseEther("0.2");
    const donationAmount = ethers.parseEther("2");
    await campaign.connect(donor).donate({ value: donationAmount });
    await ethers.provider.send("evm_increaseTime", [86400]) // add 1 day seconds
    await expect(factory.connect(owner).withdrawFunds(campaign.getAddress(), {
      value: tax,
    })).to.emit(campaign, "FundsWithdrawn").withArgs(owner.address, donationAmount);
  });

  it("Should revert if called by non-creator", async function () {
    await expect(campaign.connect(donor).withdrawFunds())
        .to.be.revertedWith("Only the creator can call this function");
  });

  it("Should revert if the campaign has not expired", async function () {
    const tax = ethers.parseEther("0.2");
    const donationAmount = ethers.parseEther("2");
    await campaign.connect(donor).donate({ value: donationAmount });
    await expect(factory.connect(owner).withdrawFunds(campaign.getAddress(), {
      value: tax,
    })).to.be.revertedWith("The campaign is still active");
  });

  it("Should revert if the target has not been reached", async function () {
    const tax = ethers.parseEther("0.2");
    await ethers.provider.send("evm_increaseTime", [2*86400]) // add 1 day seconds
    await expect(factory.connect(owner).withdrawFunds(campaign.getAddress(), {
      value: tax,
    })).to.be.revertedWith("Target amount not reached");
  });

  it("Should revert if the incorrect ether amount is sent", async function () {
    const tax = ethers.parseEther("2");
    const donationAmount = ethers.parseEther("2");
    await campaign.connect(donor).donate({ value: donationAmount });
    await ethers.provider.send("evm_increaseTime", [2*86400])
    await expect(factory.connect(owner).withdrawFunds(campaign.getAddress(), {
      value: tax,
    })).to.be.revertedWith("You need to send exactly 0.2 Ether to withdraw funds");
  });

    
  /* 
  ####################################################################
  ###################### refundAll ######################
  ####################################################################
  */
  it("should refund all donors if called by the creator after the deadline", async function () {
    const [_, __, donor1] = await ethers.getSigners();
    const donationAmount = ethers.parseEther("2");
    await campaign.connect(donor1).donate({ value: donationAmount });
    const donor1BalanceBefore = await ethers.provider.getBalance(donor1.address);
    await ethers.provider.send("evm_increaseTime", [2*86400]); // add 2 days
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [await factory.getAddress()]
    });
    const factorySigner = await ethers.provider.getSigner(await factory.getAddress());
    const donorArray = await campaign.getDonorAddresses();
    const lenght = donorArray.length;
    await expect(campaign.connect(factorySigner).refundBatch(0, lenght))
      .to.emit(campaign, "RefundAllSuccess")
      .withArgs(campaign.getAddress());
    const donor1BalanceAfter = await ethers.provider.getBalance(donor1.address);
    expect(donor1BalanceAfter).to.be.above(donor1BalanceBefore);
  });

  it("should fail if called before the deadline", async function () {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [await factory.getAddress()]
    });
    const factorySigner = await ethers.provider.getSigner(await factory.getAddress());
    const donorArray = await campaign.getDonorAddresses();
    const lenght = donorArray.length;
    await expect(campaign.connect(factorySigner).refundBatch(0, lenght)).to.be.revertedWith("The campaign is still active");
  });

  it("should only allow the creator to call refundAll", async function () {
    const donorArray = await campaign.getDonorAddresses();
    const lenght = donorArray.length;
    await expect(campaign.connect(owner).refundBatch(0, lenght)).to.be.revertedWith("Only the creator can call this function");
  });

  /* 
  ##############################################################
  ###################### getUserDonations ######################
  ##############################################################
  */
  it("Should return the donations of a user", async function () {
    await campaign.connect(donor).donate({ value: ethers.parseEther("1") });
    await campaign.connect(donor).donate({ value: ethers.parseEther("1") });
    await campaign.connect(donor).donate({ value: ethers.parseEther("1") });
    await campaign.connect(donor).donate({ value: ethers.parseEther("1") });
    const donations = await campaign.getUserDonations(donor.address);
    expect(donations.length).to.equal(4);
  });

  /* 
  ##############################################################
  ###################### getDonorAddresses ######################
  ##############################################################
  */
  it("Should return the donor addresses", async function () {
    await campaign.connect(donor).donate({ value: ethers.parseEther("1") });
    const addresses = await campaign.getDonorAddresses();
    expect(addresses.length).to.equal(1);
    expect(addresses[0]).to.equal(donor.address);
  });

});
