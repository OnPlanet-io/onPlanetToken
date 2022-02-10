const { ethers, upgrades } = require("hardhat");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { BEP20, BEP20__factory, OnPlanet, OnPlanet__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain-types";


let onPlanet: OnPlanet;
let buyBackToken: BEP20;
let myWETH: WETH9, factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;


const overrides = {
  gasLimit: 9999999
}


async function main() {

  const [deployer, ali, dave, devAddress, marketingAddress] = await ethers.getSigners();


  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  
  const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
  const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
  const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
  const WETH: WETH9__factory = await ethers.getContractFactory('WETH9');
  const BuyBackToken: BEP20__factory = await ethers.getContractFactory('BEP20');
  const OP: OnPlanet__factory = await ethers.getContractFactory("onPlanet");


  myWETH = await WETH.deploy();
  buyBackToken = await BuyBackToken.deploy();
  factory = await UniswapV2Factory.deploy(deployer.address);
  router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides);
  onPlanet = await OP.deploy(router.address, buyBackToken.address, devAddress.address, marketingAddress.address);
  // onPlanet = await OP.deploy(router.address);
  router = await UniswapV2Router02.attach(router.address);

  const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
  uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);
  
  console.log("OnPlanet Contract Address:", onPlanet.address);
  
}

main()
  .then(() =>  process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
  