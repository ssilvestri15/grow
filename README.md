# Grow - Decentralized Crowdfunding Platform

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
- **Web3 Integration**: Web3.js / Ethers.js (or a library specific to Blackhat blockchain)

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

### Running the Project

1. Start the React development server:

   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to interact with the app.

### Smart Contracts

1. Compile the smart contracts:

   ```bash
   npx hardhat compile
   ```

2. Deploy the smart contracts to the Blackhat test network:

   ```bash
   npx hardhat run scripts/deploy.js --network blackhat-testnet
   ```

3. Update the contract addresses in the React frontend code (`src/config.js`) to point to your deployed contracts.

### Connecting MetaMask

1. Open MetaMask and connect to the Blackhat network.
2. Ensure you have test funds on your account (for testing on the testnet).

## How It Works

1. **Create Campaign**: Users can create a new crowdfunding campaign by specifying a goal and a deadline.
2. **Contribute to Campaign**: Other users can contribute to the campaign by sending cryptocurrency.
3. **Campaign Success**: If the campaign reaches its goal before the deadline, the funds are released to the campaign creator.
4. **Campaign Failure**: If the campaign doesn't reach its goal, the contributions are refunded to the backers.

##

Made with ❤️ by Simone Silvestri
