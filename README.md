# Grow - Decentralized Crowdfunding Platform

![Grow Logo](https://github.com/ssilvestri15/grow/blob/main/banner.png)
![Grow Screenshots](https://github.com/ssilvestri15/grow/blob/main/banner_2.png)

## Overview

This project is a decentralized crowdfunding platform built on the **Blackhat Blockchain** using **React** for the frontend. The platform allows users to create, contribute to, and manage crowdfunding campaigns in a fully decentralized and transparent manner, leveraging the security and trustlessness of blockchain technology.

## Features

- **Decentralized**: The platform operates without intermediaries, ensuring transparency and trust using blockchain.
- **Smart Contracts**: Campaigns are managed by smart contracts, ensuring that funds are only released when certain criteria are met.
- **Contribute with Crypto**: Users can contribute to campaigns using cryptocurrency.
- **Secure**: Funds are locked in the smart contract until the campaign reaches its goal.

## Tech Stack

- **Blockchain**: Blackhat Blockchain
- **Frontend**: React.js
- **Smart Contracts**: Solidity (or the specific language used on the Blackhat blockchain)
- **Web3 Integration**: Ethers.js

## Getting Started

### Prerequisites

To run this project locally, you need to have the following installed:

- Node.js
- npm
- MetaMask (or another web3 wallet)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ssilvestri15/grow.git
   cd grow
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Run HardHat Testing Network

1. Run HardHat Network:

   ```bash
   npx hardhat node
   ```
DON'T close the terminal.

### Test Smart Contracts

1. Run hardhat testing with:

   ```bash
   npm test
   ```

### Smart Contracts

On a new terminal

1. Deploy the smart contracts to the Blackhat test network:

   ```bash
   npx hardhat run scripts/deploy.js
   ```

2. Update the contract addresses in the React frontend code (`frontend/src/config.js`) to point to your deployed contracts.

### Running the Frontend Project

1. Start the React development server:

   ```bash
   cd frontend
   nmp install
   npm run start
   ```

2. Open your browser and navigate to `http://localhost:3000` to interact with the app.

### Connecting MetaMask

1. Open MetaMask and connect to the Blackhat network.
2. Ensure you have test funds on your account (for testing on the testnet).

### Fund your wallet
To fund your wallet, follow these steps:

1. Open MetaMask and ensure your wallet is connected.
2. Copy the wallet address from MetaMask.
3. Use the following command to fund your wallet:

   ```bash
   npx hardhat run fundwallet --to YOUR_WALLET_ADDRESS --amount AMOUNT_YO_WANT
   ```
   - Replace "YOUR_WALLET_ADDRESS" with the address you copied from MetaMask.
   - Replace "AMOUNT_YO_WANT" with the needed amount.

## How It Works

1. **Create Campaign**: Users can create a new crowdfunding campaign by specifying a goal and a deadline.
2. **Contribute to Campaign**: Other users can contribute to the campaign by sending cryptocurrency.
3. **Campaign Success**: If the campaign reaches its goal before the deadline, the funds are released to the campaign creator.
4. **Campaign Failure**: If the campaign doesn't reach its goal, the contributions are refunded to the backers.

##

Made with ❤️ by Simone Silvestri
