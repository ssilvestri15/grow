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

  it("Should initialize the Campaign contract correctly", async function () {
    const factoryAddress = await factory.getAddress();
    expect(await campaign.title()).to.equal("MyCampaign");
    expect(await campaign.description()).to.equal("MyDescription");
    expect(await campaign.targetAmount()).to.equal(ethers.parseEther("1"));
    expect(await campaign.owner()).to.equal(owner.address);
    expect(await campaign.creator()).to.equal(factoryAddress);

    // Ensure the campaign is initialized and cannot be re-initialized
    await expect(
        campaign.initialize(
            "NewTitle", 
            "NewDescription", 
            owner.address, 
            factoryAddress, 
            "NewBanner", 
            "NewPoster", 
            ethers.parseEther("2"), 
            2, 
            "0x0000000000000000000000000000000000000001"
        )
    ).to.be.revertedWith("Already initialized");
})

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
######################## requestRefund ########################
####################################################################
*/

it("should allow a donor to claim a refund after the deadline if target is not reached", async function () {
  const [_, __, donor1] = await ethers.getSigners();
  const donationAmount = ethers.parseEther("0.5");

  // Donor1 makes a donation
  await campaign.connect(donor1).donate({ value: donationAmount });

  // Simulate passing the deadline
  await ethers.provider.send("evm_increaseTime", [2 * 86400]); // add 2 days
  await ethers.provider.send("evm_mine", []);

  // Verify the donor's balance before requesting refund
  const donor1BalanceBefore = await ethers.provider.getBalance(donor1.address);

  // Donor1 requests a refund
  await expect(await campaign.connect(donor1).requestRefund()).to.emit(campaign, "RefundClaimed").withArgs(donor1.address, donationAmount);

  // Verify the donor's balance after requesting refund
  const donor1BalanceAfter = await ethers.provider.getBalance(donor1.address);
  expect(donor1BalanceAfter).to.be.above(donor1BalanceBefore);
});

it("should fail if a donor tries to request a refund before the deadline", async function () {
  const [_, __, donor1] = await ethers.getSigners();
  const donationAmount = ethers.parseEther("2");

  // Donor1 makes a donation
  await campaign.connect(donor1).donate({ value: donationAmount });

  // Donor1 attempts to request a refund before the deadline
  await expect(campaign.connect(donor1).requestRefund()).to.be.revertedWith("The campaign is still active");
});

it("should fail if the target amount is reached", async function () {
  const [_, __, donor1, donor2] = await ethers.getSigners();
  const donationAmount = ethers.parseEther("5"); // Assume target amount is 10 ETH

  // Donor1 and Donor2 make donations that reach the target
  await campaign.connect(donor1).donate({ value: donationAmount });
  await campaign.connect(donor2).donate({ value: donationAmount });

  // Simulate passing the deadline
  await ethers.provider.send("evm_increaseTime", [2 * 86400]); // add 2 days
  await ethers.provider.send("evm_mine", []);

  // Donor1 attempts to request a refund after the target is reached
  await expect(campaign.connect(donor1).requestRefund()).to.be.revertedWith("Target reached, refund not allowed");
});

it("should fail if a donor tries to request a refund twice", async function () {
  const [_, __, donor1] = await ethers.getSigners();
  const donationAmount = ethers.parseEther("0.5");

  // Donor1 makes a donation
  await campaign.connect(donor1).donate({ value: donationAmount });

  // Simulate passing the deadline
  await ethers.provider.send("evm_increaseTime", [2 * 86400]); // add 2 days
  await ethers.provider.send("evm_mine", []);

  // Donor1 requests a refund
  await expect(await campaign.connect(donor1).requestRefund()).to.emit(campaign, "RefundClaimed").withArgs(donor1.address, donationAmount);

  // Donor1 attempts to request a refund again
  await expect(campaign.connect(donor1).requestRefund()).to.be.revertedWith("Refund already requested");
});

it("should fail if a non-donor tries to request a refund", async function () {
  const [_, __, nonDonor] = await ethers.getSigners();

  // Simulate passing the deadline
  await ethers.provider.send("evm_increaseTime", [2 * 86400]); // add 2 days
  await ethers.provider.send("evm_mine", []);

  // Non-donor attempts to request a refund
  await expect(campaign.connect(nonDonor).requestRefund()).to.be.revertedWith("Nothing to refund");
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
