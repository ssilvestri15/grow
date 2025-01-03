// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT", function () {

    let nftContract;
    let creator;
    let owner;
    let donor;
    let donor2;

    beforeEach(async function () {
        [creator, owner, donor, donor2] = await ethers.getSigners();
        
        // Deploy the CrowdfundingFactory contract
        const NftFactory = await ethers.getContractFactory("NFTFactory");
        const factory = await NftFactory.deploy();
        await factory.waitForDeployment()
        const title = "MyNFT";
        const symbol = "MNFT";
        await expect(await factory.createNFTContract(title, symbol))
            .to.emit(factory, "NFTContractCreated")
            .withArgs(title, symbol);

        const nftAddress = await factory.getNFTContract(title, symbol);
        expect(nftAddress).to.be.properAddress;
        nftContract = await ethers.getContractAt("NFT", nftAddress);
    });
    
    it ("Should have the correct name and symbol", async function () {
        expect(await nftContract.name()).to.equal("MyNFT");
        expect(await nftContract.symbol()).to.equal("MNFT");
    });

    it("Should initialize the NFT contract correctly", async function () {
        expect(await nftContract.name()).to.equal("MyNFT");
        expect(await nftContract.symbol()).to.equal("MNFT");
        expect(await nftContract.contractCreator()).to.equal(creator.address);
    
        // Check that it's initialized and cannot be re-initialized
        await expect(
            nftContract.initialize("AnotherName", "AN", creator.address)
        ).to.be.revertedWith("Already initialized");
    });
    

    /*
    ######################################################
    ###################### setOwner ######################
    ######################################################
    */
    it("Should the creator can set the owner", async function () {
        await nftContract.setOwner(owner.address);
        expect(await nftContract.contractOwner()).to.equal(owner.address);
    });

    it("Should revert is not the creator trying to set the owner", async function () {
        await expect(nftContract.connect(donor).setOwner(owner.address)).to.be.revertedWith("Caller can't edit this parameter of the NFT");
    });

    /*
    ##################################################
    ###################### mint ######################
    ##################################################
    */
    it("Should the owner can mint a token", async function () {
        await nftContract.setOwner(owner.address);
        await expect(nftContract.connect(owner).mint(donor.address)).to.emit(nftContract, "Minted");
    });

    it("Should revert if not the owner trying to mint", async function () {
        await nftContract.setOwner(owner.address);
        await expect(nftContract.connect(donor).mint(donor.address)).to.be.revertedWith("Caller can't create NFT");
    });

    it("Should revert if the owner trying to mint to the zero address", async function () {
        await nftContract.setOwner(owner.address);
        await expect(nftContract.connect(owner).mint(ethers.ZeroAddress)).to.be.revertedWith("Cannot mint to zero address");
    });

    it("Should revert if donor already have a token", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        await expect(nftContract.connect(owner).mint(donor.address)).to.be.revertedWith("Recipient already owns a token");
    });

    /*
    ###############################################################
    ###################### transferOwnership ######################
    ###############################################################
    */
    it("Should the tokenOwner can transfer the ownership", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        const token = await nftContract.tokenOwner(donor.address);
        await expect(nftContract.connect(donor).transferOwnership(donor2.address)).to.emit(nftContract, "Transfer").withArgs(donor.address, donor2.address, token);
    });

    it("Should revert if not the tokenOwner do not have token", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        await expect(nftContract.connect(donor2).transferOwnership(donor.address)).to.be.revertedWith("You do not own any token");
    });

    it("Should revert if recipient already have a token", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        await nftContract.connect(owner).mint(donor2.address);
        await expect(nftContract.connect(donor2).transferOwnership(donor.address)).to.be.revertedWith("Recipient already owns a token");
    });

    it("Should revert if recipient is the zero address", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        await expect(nftContract.connect(donor).transferOwnership(ethers.ZeroAddress)).to.be.revertedWith("Cannot transfer to zero address");
    });

    /*
    ##################################################
    ###################### burn ######################
    ##################################################
    */
   it("Should the tokenOwner can burn the token", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        const token = await nftContract.tokenOwner(donor.address);
        await expect(nftContract.connect(donor).burn()).to.emit(nftContract, "Burned").withArgs(token);
   });

    it("Should revert if not the tokenOwner do not have token", async function () {
        await nftContract.setOwner(owner.address);
        await nftContract.connect(owner).mint(donor.address);
        await expect(nftContract.connect(donor2).burn()).to.be.revertedWith("You do not own any token");
    });

});