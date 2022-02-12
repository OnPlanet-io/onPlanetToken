const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
import { network } from "hardhat";
// import {web3} from "@nomiclabs/hardhat-web3";

const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { BEP20, BEP20__factory, OnPlanet, OnPlanet__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain-types";
import { FormatTypes } from "ethers/lib/utils";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const deadAddress = "0x000000000000000000000000000000000000dEaD";
// const stakingAddress = "0x000000000000000000000000000000000000dEaD";


const overrides = {
    gasLimit: 9999999
}

let deployer: SignerWithAddress, ali: SignerWithAddress, dave: SignerWithAddress, ray: SignerWithAddress;
let devAddress: SignerWithAddress, marketingAddress: SignerWithAddress, stakingAddress: SignerWithAddress;

let onPlanet: OnPlanet;
let buyBackToken: BEP20;
let myWETH: WETH9, factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;

describe('onPlanet Single Test', () => {

    // beforeEach("", async () => {

    //     [deployer, ali, dave, ray, devAddress, marketingAddress, stakingAddress] = await ethers.getSigners();

    //     const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
    //     const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
    //     const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
    //     const WETH: WETH9__factory = await ethers.getContractFactory('WETH9');
    //     const BuyBackToken: BEP20__factory = await ethers.getContractFactory('BEP20');
    //     const OP: OnPlanet__factory = await ethers.getContractFactory("onPlanet");


    //     myWETH = await WETH.deploy();
    //     buyBackToken = await BuyBackToken.deploy();
    //     factory = await UniswapV2Factory.deploy(deployer.address);
    //     router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides);

    //     onPlanet = await OP.deploy(router.address, buyBackToken.address, devAddress.address, marketingAddress.address);
    //     router = await UniswapV2Router02.attach(router.address);

    //     const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
    //     uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);

    // });

    // const startTrading = async () => {
    //     const OneMinute = Number(await time.duration.minutes(1));

    //     await onPlanet.setTradingEnabled(5, 10)

    //     await network.provider.send("evm_increaseTime", [5 * OneMinute])
    //     await network.provider.send("evm_mine")
    // }

    // const provideLiquidity2 = async () => {
    //     let latestBlock = await ethers.provider.getBlock("latest")

    //     await onPlanet.approve(router.address, ethers.utils.parseEther("228614400"));
    //     await router.addLiquidityETH(
    //         onPlanet.address,
    //         ethers.utils.parseEther("228614400"),
    //         0,
    //         0,
    //         deployer.address,
    //         latestBlock.timestamp + 60,
    //         { value: ethers.utils.parseEther("1176") }
    //     )

    // }

    // const provideLiquidityForBuyBackToken = async () => {
    //     let latestBlock = await ethers.provider.getBlock("latest")

    //     await buyBackToken.mint(ali.address, ethers.utils.parseEther("5000000"))
    //     await buyBackToken.connect(ali).approve(router.address, ethers.utils.parseEther("5000000"))
    //     await router.connect(ali).addLiquidityETH(
    //         buyBackToken.address,
    //         ethers.utils.parseEther("5000"),
    //         0,
    //         0,
    //         deployer.address,
    //         latestBlock.timestamp + 60,
    //         { value: ethers.utils.parseEther("50") }
    //     )

    // }


})