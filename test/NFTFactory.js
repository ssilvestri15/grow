// SPDX-License-Identifier: MIT
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTFactory", function () {
  let NFTFactory;
  let factory;

  beforeEach(async function () {
    // Get the NFTFactory contract
    NFTFactory = await ethers.getContractFactory("NFTFactory");
    // Deploy the NFTFactory contract
    factory = await NFTFactory.deploy();
  });

  it("should create an NFT contract", async function () {
    const name = "MyNFT";
    const symbol = "MNFT";
    // Check that the event was emitted
    await expect(factory.createNFTContract(name, symbol)).to.emit(factory, "NFTContractCreated").withArgs(name, symbol);
  });

  it("should not allow creating an NFT contract with the same name and symbol", async function () {
    const name = "MyNFT";
    const symbol = "MNFT";

    // Create the first NFT contract
    await factory.createNFTContract(name, symbol);

    // Attempt to create a second NFT contract with the same name and symbol
    await expect(factory.createNFTContract(name, symbol))
      .to.be.revertedWith("NFT contract already exists");
  });

});
