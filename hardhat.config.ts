require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-web3");
require('solidity-coverage')
require('@typechain/hardhat')
require("dotenv").config();
import {task } from "hardhat/config";

task("accounts", "Prints the list of accounts", async (taskArgs, hre: any) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  //   defaultNetwork: "mainnet",
  //   etherscan: {
  //     apiKey: process.env.BSCSCAN_KEY
  //   },
  //   networks: {
  //     testnet: {
  //       url: "https://data-seed-prebsc-1-s1.binance.org:8545",
  //       chainId: 97,
  //       // gas: 2100000,
  //       // gasPrice: 8000000000,
  //       accounts: [process.env.PRIVATEKEY]
  //     },
  //     mainnet: {
  //       url: "https://bsc-dataseed.binance.org/",
  //       chainId: 56,
  //       // gas: 2100000,
  //       // gasPrice: 8000000000,
  //       accounts: [process.env.PRIVATEKEY]
  //     }
  //   },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
      {
        version: "0.5.16",
        settings: {},
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      },
    ],

  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 20000
  }
};