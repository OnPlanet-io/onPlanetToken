const { ethers, upgrades } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  
  const OP = await ethers.getContractFactory("onPlanet");
  let onPlanet = await OP.deploy();
  console.log("OnPlanet Contract Address:", onPlanet.address);
  
}

main()
  .then(() =>  process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  