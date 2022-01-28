// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-truffle5");
// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-ethers");
// require("@openzeppelin/hardhat-upgrades");
// require("@nomiclabs/hardhat-web3");
// require('solidity-coverage')
// require('@typechain/hardhat')
// require("dotenv").config();
// import {task } from "hardhat/config";

// task("accounts", "Prints the list of accounts", async (taskArgs, hre: any) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// module.exports = {
//   //   defaultNetwork: "mainnet",
//   //   etherscan: {
//   //     apiKey: process.env.BSCSCAN_KEY
//   //   },
//   //   networks: {
//   //     testnet: {
//   //       url: "https://data-seed-prebsc-1-s1.binance.org:8545",
//   //       chainId: 97,
//   //       // gas: 2100000,
//   //       // gasPrice: 8000000000,
//   //       accounts: [process.env.PRIVATEKEY]
//   //     },
//   //     mainnet: {
//   //       url: "https://bsc-dataseed.binance.org/",
//   //       chainId: 56,
//   //       // gas: 2100000,
//   //       // gasPrice: 8000000000,
//   //       accounts: [process.env.PRIVATEKEY]
//   //     }
//   //   },
//   solidity: {
//     compilers: [
//       {
//         version: "0.8.4",
//         settings: {
//           optimizer: {
//             enabled: true,
//             runs: 200,
//           }
//         }
//       },
//       {
//         version: "0.5.16",
//         settings: {},
//       },
//       {
//         version: "0.6.6",
//         settings: {
//           optimizer: {
//             enabled: true,
//             runs: 200,
//           }
//         }
//       },
//     ],

//   },
//   paths: {
//     sources: "./contracts",
//     tests: "./test",
//     cache: "./cache",
//     artifacts: "./artifacts"
//   },
//   mocha: {
//     timeout: 20000
//   }
// };



import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
// import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-truffle5");
// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-ethers");
// require("@openzeppelin/hardhat-upgrades");
// require("@nomiclabs/hardhat-web3");
// require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  networks: {
    // hardhat: {
    //   forking: {
    //     url: "https://eth-mainnet.alchemyapi.io/v2/Cqp4h9NyXLt9dvDolHa1otbF-PLMmUBI"
    //   }
    // },
    localhost: {
      url: "http://127.0.0.1:8545",
      gasPrice: 0
    },
  },
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

  // networks: {
  //   ropsten: {
  //     url: process.env.ROPSTEN_URL || "",
  //     accounts:
  //       process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
  //   },
  // },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  // },
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
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

export default config;



// https://eth-mainnet.alchemyapi.io/v2/Cqp4h9NyXLt9dvDolHa1otbF-PLMmUBI
// npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/Cqp4h9NyXLt9dvDolHa1otbF-PLMmUBI
