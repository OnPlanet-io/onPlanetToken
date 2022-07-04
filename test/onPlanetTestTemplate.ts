const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
import { network } from "hardhat";
// import {web3} from "@nomiclabs/hardhat-web3";

const { ethers, waffle } = require("hardhat");
// const provider = waffle.provider;
// const { web3 } = require('@openzeppelin/test-helpers/src/setup');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { 
    BEP20, 
    BEP20__factory, 
    OnPlanet, 
    OnPlanet__factory, 
    UniswapV2Factory, 
    UniswapV2Factory__factory, 
    UniswapV2Pair, 
    UniswapV2Pair__factory, 
    UniswapV2Router02, 
    UniswapV2Router02__factory, 
    WETH9, 
    WETH9__factory,
    OPAgreement__factory,
    OPAgreement
} from "../typechain-types";
import { FormatTypes } from "ethers/lib/utils";
import {  } from "../typechain-types/factories/OPAgreement__factory";
import {  } from "../typechain-types/OPAgreement";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const deadAddress = "0x000000000000000000000000000000000000dEaD";


const overrides = {
    gasLimit: 9999999
}

let deployer: SignerWithAddress, ali: SignerWithAddress, dave: SignerWithAddress, ray: SignerWithAddress;
let devAddress: SignerWithAddress, marketingAddress: SignerWithAddress, stakingAddress: SignerWithAddress;

let onPlanet: OnPlanet;
let buyBackToken: BEP20;
let myWETH: WETH9, factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;
let agreementContract: OPAgreement

describe('onPlanet Single Test', () => {

    beforeEach("", async () => {

        [deployer, ali, dave, ray, devAddress, marketingAddress, stakingAddress] = await ethers.getSigners();

        const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
        const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
        const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
        const WETH: WETH9__factory = await ethers.getContractFactory('WETH9');
        const BuyBackToken: BEP20__factory = await ethers.getContractFactory('BEP20');
        const OP: OnPlanet__factory = await ethers.getContractFactory("OnPlanet");
        const AgreementContract: OPAgreement__factory = await ethers.getContractFactory("OPAgreement");

        myWETH = await WETH.deploy();
        buyBackToken = await BuyBackToken.deploy();
        factory = await UniswapV2Factory.deploy(deployer.address);
        router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides);
        // router = await UniswapV2Router02.attach(router.address);

        onPlanet = await OP.deploy(router.address, buyBackToken.address, devAddress.address, marketingAddress.address );
        await onPlanet.setBuyBackTokenAddress(buyBackToken.address);
        await onPlanet.setDeveloperAddress(devAddress.address);
        await onPlanet.setMarketingAddress(marketingAddress.address);

        const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
        uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);

        agreementContract = await AgreementContract.deploy(onPlanet.address);
        await onPlanet.setAgreementContract(agreementContract.address);

    });

    const startTrading = async () => {
        const OneMinute = Number(await time.duration.minutes(1));

        await onPlanet.setTradingEnabled(5, 10)

        await network.provider.send("evm_increaseTime", [5 * OneMinute])
        await network.provider.send("evm_mine")
    }

    const provideLiquidity = async () => {
        let latestBlock = await ethers.provider.getBlock("latest")

        await onPlanet.approve(router.address, ethers.utils.parseEther("5000"))
        await router.addLiquidityETH(
            onPlanet.address,
            ethers.utils.parseEther("5000"),
            0,
            0,
            deployer.address,
            latestBlock.timestamp + 60,
            { value: ethers.utils.parseEther("50") }
        )

    }

    const provideLiquidity2 = async () => {
        let latestBlock = await ethers.provider.getBlock("latest")

        await onPlanet.approve(router.address, ethers.utils.parseEther("228614400"));
        await router.addLiquidityETH(
            onPlanet.address,
            ethers.utils.parseEther("228614400"),
            0,
            0,
            deployer.address,
            latestBlock.timestamp + 60,
            { value: ethers.utils.parseEther("1176") }
        )

    }

    const provideLiquidityForBuyBackToken = async () => {
        let latestBlock = await ethers.provider.getBlock("latest")

        await buyBackToken.mint(ali.address, ethers.utils.parseEther("5000000"))
        await buyBackToken.connect(ali).approve(router.address, ethers.utils.parseEther("5000000"))
        await router.connect(ali).addLiquidityETH(
            buyBackToken.address,
            ethers.utils.parseEther("5000"),
            0,
            0,
            deployer.address,
            latestBlock.timestamp + 60,
            { value: ethers.utils.parseEther("50") }
        )

    }



    it("OP-V2 test stack", async () => {

        let latestBlock;
        await onPlanet.setTradingEnabled(1, 2);

        await provideLiquidity2();

        await network.provider.send("evm_increaseTime", [3 * 60])
        await network.provider.send("evm_mine")

        expect(await onPlanet.inTradingStartCoolDown()).to.be.equal(false);

        latestBlock = await ethers.provider.getBlock("latest")

        await onPlanet.transfer(ali.address, ethers.utils.parseEther("100"));

        console.log("Balance of Ali", (await onPlanet.balanceOf(ali.address)).toString());
        
        await agreementContract.connect(ali).makeAgreement(ethers.utils.parseEther("10"));
        console.log("Staked tokens by Ali", (await agreementContract.stakedTokens(ali.address)).toString());
        console.log("total tokens staked", (await agreementContract.totalStakedTokens()).toString());
        console.log(" ")
        console.log("Ali's remaing balance is reducing")
        await onPlanet.connect(ali).transfer(deployer.address, ethers.utils.parseEther("50"));
        console.log("Balance of Ali", (await onPlanet.balanceOf(ali.address)).toString());
        console.log("Staked tokens by Ali", (await agreementContract.stakedTokens(ali.address)).toString());
        console.log("total tokens staked", (await agreementContract.totalStakedTokens()).toString());
        console.log(" ")

        await onPlanet.connect(ali).transfer(deployer.address, ethers.utils.parseEther("30"));
        console.log("Balance of Ali", (await onPlanet.balanceOf(ali.address)).toString());
        console.log("Staked tokens by Ali", (await agreementContract.stakedTokens(ali.address)).toString());
        console.log("total tokens staked", (await agreementContract.totalStakedTokens()).toString());
        console.log(" ")

        await onPlanet.connect(ali).transfer(deployer.address, ethers.utils.parseEther("10"));
        console.log("Balance of Ali", (await onPlanet.balanceOf(ali.address)).toString());
        console.log("Staked tokens by Ali", (await agreementContract.stakedTokens(ali.address)).toString());
        console.log("total tokens staked", (await agreementContract.totalStakedTokens()).toString());
        console.log(" ")

        await onPlanet.connect(ali).transfer(deployer.address, 1);
        console.log("Balance of Ali", (await onPlanet.balanceOf(ali.address)).toString());
        console.log("Staked tokens by Ali", (await agreementContract.stakedTokens(ali.address)).toString());
        console.log("total tokens staked",  (await agreementContract.totalStakedTokens()).toString());

        // await onPlanet.excludeFromReward(ray.address);
        // await onPlanet.excludeFromReward(stakingAddress.address);
        
        // console.log("Transfering 400000000 tokens to Ray")
        // await onPlanet.transfer(ray.address, ethers.utils.parseEther("400000000"));
        // console.log(" ")

        // console.log("Transfering 10000000 tokens to Ali")
        // await onPlanet.transfer(ali.address, ethers.utils.parseEther(String(5000000)));
        // await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther(String(5000000)));
        // console.log(" ")

        // console.log("Ali is trying to sell his 5000000 tokens in cooldown period");
        // for (let i = 0; i < 5; i++) {
        //     try {
        //         await router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
        //             ethers.utils.parseEther("1000000"),
        //             ethers.utils.parseEther("0"),
        //             [onPlanet.address, myWETH.address],
        //             dave.address,
        //             latestBlock.timestamp + 60,
        //         )
        //         console.log(" ")

        //     }
        //     catch (e) {
        //         console.log("swapExactTokensForETHSupportingFeeOnTransferTokens Faild")
        //         console.log(e)
        //     }
        // }

        // console.log("Dave is trying to buy tokens worth of 100 BNB 5 times in cooldown period")
        // for (let i = 0; i < 5; i++) {
        //     try {

        //         await router.connect(dave).swapETHForExactTokens(
        //             ethers.utils.parseEther("500000"),
        //             [myWETH.address, onPlanet.address],
        //             dave.address,
        //             latestBlock.timestamp + 60,
        //             { value: ethers.utils.parseEther("500") }
        //         )
        //         console.log(" ")

        //     }
        //     catch (e) {
        //         console.log("swapExactETHForTokensSupportingFeeOnTransferTokens Faild")
        //         // console.log(e)
        //     }
        // }


    })


})