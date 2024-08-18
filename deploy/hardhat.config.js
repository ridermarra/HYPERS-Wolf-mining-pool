require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    blast: {
      url: "https://blast-mainnet.infura.io/v3/b03abf15f1254f6cb0119f6b578f59d8",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    testnet: {
      url: "https://blast-sepolia.infura.io/v3/b03abf15f1254f6cb0119f6b578f59d8",
      accounts: [`0x${process.env.PRIVATE_KEY}`]
  }
  }
};
