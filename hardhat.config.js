require("@nomicfoundation/hardhat-toolbox");
require("./tasks/fundwallet");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
  },
  solidity: "0.8.28",
};
