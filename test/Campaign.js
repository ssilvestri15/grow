// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Campaign", function () {
  
    let campaign;
    let donor;
    let owner;

  beforeEach(async function () {


    [owner, donor] = await ethers.getSigners();

    // Deploy the CrowdfundingFactory contract
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    const factory = await CrowdfundingFactory.deploy();
    await factory.waitForDeployment()

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
    await campaign.connect(owner).closeCampaignAndRefund();

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

  it("should update currentAmount and emit Donated event on successful donation.", async function () {
    const donationAmount = ethers.parseEther("1");

    // Controlla che l’evento Donated sia emesso con i dati corretti
    await expect(
      campaign.connect(donor).donate({ value: donationAmount })
    )
      .to.emit(campaign, "Donated")
      .withArgs(donor.address, donationAmount);

    // Controlla che currentAmount sia stato aggiornato
    const currentAmount = await campaign.currentAmount();
    expect(currentAmount).to.equal(donationAmount);
  });

    
  /* 
  ###########################################################
  ###################### withdrawFunds ######################
  ###########################################################
  */
  it("should allow the owner to withdraw the funds after the campaign is closed.", async function () {
    const tax = ethers.parseEther("0.2");
    const donationAmount = ethers.parseEther("2");
    // Donazione iniziale
    await campaign.connect(donor).donate({ value: donationAmount });
    await ethers.provider.send("evm_increaseTime", [86400]) // add 1 day seconds

    await expect(campaign.connect(owner).withdrawFunds({ value: tax })) // 25% of the target
    .to.emit(campaign, "FundsWithdrawn").withArgs(owner.address, donationAmount);
  });

  it("Should revert if called by non-owner", async function () {
    await expect(campaign.connect(donor).withdrawFunds({ value: ethers.parseEther("0.2") }))
        .to.be.revertedWith("Only the owner can withdraw funds");
  });

  it("Should revert if the campaign has not expired", async function () {
    await expect(campaign.connect(owner).withdrawFunds({ value: ethers.parseEther("0.2") }))
        .to.be.revertedWith("The campaign has not yet expired");
  });

  it("Should revert if the target has not been reached", async function () {
    await ethers.provider.send("evm_increaseTime", [86400]) // add 1 day seconds
    await expect(campaign.connect(owner).withdrawFunds({ value: ethers.parseEther("0.2") }))
        .to.be.revertedWith("The target has not been reached");
  });

  it("Should revert if the incorrect ether amount is sent", async function () {
    await campaign.connect(donor).donate({ value: ethers.parseEther("2") });
    await ethers.provider.send("evm_increaseTime", [2*86400]) // add 1 day seconds
    await expect(campaign.connect(owner).withdrawFunds({ value: ethers.parseEther("0.1") }))
        .to.be.revertedWith("You need to 0.2 ether to withdraw funds");
  });

    
  /* 
  ####################################################################
  ###################### closeCampaignAndRefund ######################
  ####################################################################
  */
  it("Should close and refund all if requested by the owner", async function () {
    await campaign.connect(donor).donate({ value: ethers.parseEther("2") });
    await expect(campaign.connect(owner).closeCampaignAndRefund())
        .to.emit(campaign, "CampaignClosed");
  });

  it("Should revert if the campaign has already been closed", async function () {
    await campaign.connect(donor).donate({ value: ethers.parseEther("2") });
    await ethers.provider.send("evm_increaseTime", [2*86400]) // add 1 day seconds
    await campaign.connect(owner).withdrawFunds({ value: ethers.parseEther("0.2") });
    await expect(campaign.connect(owner).closeCampaignAndRefund())
        .to.be.revertedWith("The campaign is already closed");
  });

  it("should revert if not owner or creator tries to close the campaign.", async function () {
    await expect(
      campaign.connect(donor).closeCampaignAndRefund()
    ).to.be.revertedWith("You can't close this campaign");
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
  ################################################################
  ###################### getRandomDonations ######################
  ################################################################
  */
  it("Should return the random donations", async function () {
    //Create 100 differnt donor and each one donate 1 ether
    for (let i = 0; i < 11; i++) {
      // Generate a new random wallet and connect it to the provider
      const wallet = ethers.Wallet.createRandom();

      // Fund the wallet by sending ether from a signer account
      await owner.sendTransaction({
        to: wallet.address,
        value: ethers.parseEther("1.1"), // Fund with 1.1 ETH to cover gas
      });

      const connectedWallet = wallet.connect(ethers.provider);
      await campaign.connect(connectedWallet).donate({ value: ethers.parseEther("1") });
    }
    const donations = await campaign.getRandomDonations(10);
    expect(donations.length).to.equal(10);
  });

});
