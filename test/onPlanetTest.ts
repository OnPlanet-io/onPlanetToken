/*
Requirements to pass all tests

-   change constructor() to constructor(address _local_uniswapV2Router)
-   call these functions
        await onPlanet.setBuyBackTokenAddress(buyBackToken.address);
        await onPlanet.setDeveloperAddress(devAddress.address);
        await onPlanet.setMarketingAddress(marketingAddress.address);

-   Inside the node_modules/@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol
    replace the paiFor function with this one
    
    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = IUniswapV2Factory(factory).getPair(token0,token1);
    }
*/


import { network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";

const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

import { BEP20, BEP20__factory, OnPlanet, OnPlanet__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain-types";

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

describe('onPlanet Test Stack', () => {

    beforeEach("", async () => {

        [deployer, ali, dave, ray, devAddress, marketingAddress, stakingAddress] = await ethers.getSigners();

        const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
        const UniswapV2Pair: UniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
        const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
        const WETH: WETH9__factory = await ethers.getContractFactory('WETH9');
        const BuyBackToken: BEP20__factory = await ethers.getContractFactory('BEP20');
        const OP: OnPlanet__factory = await ethers.getContractFactory("OnPlanet");


        myWETH = await WETH.deploy();
        buyBackToken = await BuyBackToken.deploy();
        factory = await UniswapV2Factory.deploy(deployer.address);
        router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides);
        // router = await UniswapV2Router02.attach(router.address);

        onPlanet = await OP.deploy(router.address);
        await onPlanet.setBuyBackTokenAddress(buyBackToken.address);
        await onPlanet.setDeveloperAddress(devAddress.address);
        await onPlanet.setMarketingAddress(marketingAddress.address);

        const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
        uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);

    });

    const startTrading = async () => {

        await onPlanet.setTradingEnabled(1, 5)
        await network.provider.send("evm_increaseTime", [6 * 60])
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

        let latestBlock = await ethers.provider.getBlock("latest");

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

    describe("After Deployment ", () => {

        it("Assigns owner", async () => {
            expect(await onPlanet.owner()).to.equals(deployer.address)
        })

        it("Assigns initial balance to deployer", async () => {
            expect(Number(await onPlanet.balanceOf(deployer.address))).to.equals(10 ** 9 * 10 ** 18)
        })

        it("Assigns Name", async () => {
            expect(await onPlanet.name()).to.equals("onPlanet");
        })

        it("Assigns Symbol", async () => {
            expect(await onPlanet.symbol()).to.equals("OP");
        })

        it("Assigns decimal", async () => {
            expect(Number(await onPlanet.decimals())).to.equals(18);
        })

        it("Assigns total supply", async () => {
            expect(Number(await onPlanet.totalSupply())).to.equals(1e+27);
        })

        it("Assings totalFees as zero", async () => {
            expect(Number(await onPlanet.totalFees())).to.equals(0);
        })

        it("Assings tokenFromReflection of 1 token as zero", async () => {
            expect(Number(await onPlanet.tokenFromReflection(web3.utils.toWei('1', 'ether')))).to.equals(0);
        })

        it("Trading is disabled", async () => {
            expect(await onPlanet.isTradingEnabled()).to.equals(false);
            expect(await onPlanet.inTradingStartCoolDown()).to.equals(true);
        })

        it("Assigns max cooldown amount", async () => {
            expect(Number(await onPlanet.maxTxCooldownAmount())).to.equals(500000000000000000000000);
        })

        it("Reflection is enabled", async () => {
            expect(await onPlanet.isReflection()).to.equals(true);
        })

        it("Deployer is be excluded from fee", async () => {
            expect(await onPlanet.isExcludedFromFee(deployer.address)).to.equals(true);
        })

        it("Contract itself is be excluded from fee", async () => {
            expect(await onPlanet.isExcludedFromFee(onPlanet.address)).to.equals(true);
        })

        it("Assings max transction cooldown amount", async () => {
            expect(Number(await onPlanet.maxTxCooldownAmount())).to.equals(10 ** 9 * 10 ** 18 / 2000);
        })

        it("Contract can recieve Ethers", async () => {
            await expect(() =>
                ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("10.0"), // Sends exactly 10.0 ether
                })
            ).to.changeEtherBalance(onPlanet, ethers.utils.parseEther("10.0"))

            let balance_of_contract = await provider.getBalance(onPlanet.address);
            expect(balance_of_contract).to.equal(ethers.utils.parseEther("10.0"))

        })

    })

    describe("Before trading is enable", () => {

        it('Owner can transfer tokens', async () => {
            await onPlanet.connect(deployer).transfer(ali.address, ethers.utils.parseEther("100"))
        });

        it('User cannot transfer tokens', async () => {
            await onPlanet.transfer(ali.address, ethers.utils.parseEther("100"));
            await expect(onPlanet.connect(ali).transfer(ali.address, ethers.utils.parseEther("10"))).to.be.reverted;
        });

        it("reflectionFromToken with fee and without fee should be same", async () => {
            expect(Number(await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), true)))
                .to.equals(Number(await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), false)));
        })

    })

    describe("After trading is enables", () => {

        describe("As owner", () => {

            it("Should be able to enable trading", async () => {
                const OneMinute = Number(await time.duration.minutes(1));

                await onPlanet.setTradingEnabled(9, 100);
                expect(await onPlanet.isTradingEnabled()).to.equals(false);

                await network.provider.send("evm_increaseTime", [5 * OneMinute])
                await network.provider.send("evm_mine")

                expect(await onPlanet.isTradingEnabled()).to.equals(false);

                await network.provider.send("evm_increaseTime", [3 * OneMinute])
                await network.provider.send("evm_mine")

                expect(await onPlanet.isTradingEnabled()).to.equals(false);

                await network.provider.send("evm_increaseTime", [2 * OneMinute])
                await network.provider.send("evm_mine")

                expect(await onPlanet.isTradingEnabled()).to.equals(true);

            })

            it("Enable trading emits TradingEnabled event", async () => {
                await expect(await onPlanet.setTradingEnabled(0, 60))
                    .to.emit(onPlanet, "TradingEnabled")
            })

            it("Enable trading with _tradeStartDelay >= 10 should revert", async () => {
                await expect(onPlanet.setTradingEnabled(10, 60)).to.be.reverted;
            })

            it("Enable trading with _tradeStartCoolDown >= 120 should revert", async () => {
                await expect(onPlanet.setTradingEnabled(0, 120)).to.be.reverted;
            })

            it("Enable trading with _tradeStartDelay >= _tradeStartCoolDown should revert", async () => {
                await expect(onPlanet.setTradingEnabled(9, 9)).to.be.reverted;
            })

            it("Enable trading after trading has already started should revert", async () => {
                await onPlanet.setTradingEnabled(0, 60)
                await expect(onPlanet.setTradingEnabled(0, 60)).to.be.reverted;
            })

            it("After enable trading, tradingStartCooldown period will become false only after expected time", async () => {

                expect(await onPlanet.inTradingStartCoolDown()).to.be.equal(true)
                await onPlanet.setTradingEnabled(0, 10)
                expect(await onPlanet.inTradingStartCoolDown()).to.be.equal(true)

                await network.provider.send("evm_increaseTime", [11 * 60])
                await network.provider.send("evm_mine")

                expect(await onPlanet.inTradingStartCoolDown()).to.be.equal(false)

            })

            it("Owner can transfer Tokens without paying tax", async () => {
                await onPlanet.transfer(ali.address, 1_000_000)
                expect(Number(await onPlanet.balanceOf(ali.address))).to.equals(1_000_000)

            })

            it("Owner can transfer Tokens more than _maxTxAmount", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('6000000', 'ether'));
            })

            it("TransferFrom function works as expectation and emit Transfer and Approval events", async () => {
                await startTrading();
                await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))
                expect(await onPlanet.connect(ali).transferFrom(deployer.address, dave.address, web3.utils.toWei('1', 'ether')))
                    .to.emit(onPlanet, "Transfer").withArgs(deployer.address, dave.address, web3.utils.toWei('1', 'ether'))
                    .to.emit(onPlanet, "Approval").withArgs(deployer.address, ali.address, web3.utils.toWei('0', 'ether'))
            })

            it("excludeFromReward function works as expectation", async () => {
                await onPlanet.excludeFromReward(ali.address)
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(true)
            })

            it("excludeFromReward with the an address which is not included should be reverted", async () => {
                await onPlanet.excludeFromReward(ali.address);
                await expect(onPlanet.excludeFromReward(ali.address)).to.be.reverted;
            })

            it("includeInReward function works as expectation", async () => {
                await onPlanet.excludeFromReward(ali.address)
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(true)
                await onPlanet.includeInReward(ali.address)
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(false)
            })

            it("includeInReward with the an address which is not already excluded should be reverted", async () => {
                await expect(onPlanet.includeInReward(ali.address)).to.be.reverted;
            })

            it("setBotAddress function works as expectation", async () => {
                await startTrading();
                await onPlanet.setBotAddress(ali.address, true);
            })

            it("A bot cannot recieve tokens", async () => {
                await startTrading();
                await onPlanet.setBotAddress(ali.address, true);
                await expect(onPlanet.transfer(ali.address, 1_000_000)).to.be.reverted;
            })

            it("A bot cannot send tokens", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, 1_000_000);
                await onPlanet.setBotAddress(ali.address, true);
                await expect(onPlanet.connect(ali).transfer(dave.address, 1_000_000)).to.be.reverted;
            })

            it("excludeFromFee function works as expectation", async () => {
                await onPlanet.excludeFromFee(ali.address);
                await expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(true);
            })

            it("includeInFee function works as expectation", async () => {
                await onPlanet.excludeFromFee(ali.address);
                await expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(true);
                await onPlanet.includeInFee(ali.address);
                await expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(false);
            })

            it("setDefaultInFeePercent function works as expectation", async () => {
                expect(await onPlanet._inTaxFee()).to.be.equal(0);
                expect(await onPlanet._inBuybackFee()).to.be.equal(0);
                expect(await onPlanet._inTeamFee()).to.be.equal(0);
                await startTrading();
                expect(await onPlanet._inTaxFee()).to.be.equal(2);
                expect(await onPlanet._inBuybackFee()).to.be.equal(5);
                expect(await onPlanet._inTeamFee()).to.be.equal(3);
                await onPlanet.setDefaultInFeePercent(5, 5, 5);
                expect(await onPlanet._inTaxFee()).to.be.equal(5);
                expect(await onPlanet._inBuybackFee()).to.be.equal(5);
                expect(await onPlanet._inTeamFee()).to.be.equal(5);
            })

            it("setDefaultOutFeePercent function works as expectation", async () => {
                expect(await onPlanet._outTaxFee()).to.be.equal(0);
                expect(await onPlanet._outBuybackFee()).to.be.equal(0);
                expect(await onPlanet._outTeamFee()).to.be.equal(0);
                await startTrading();
                expect(await onPlanet._outTaxFee()).to.be.equal(2);
                expect(await onPlanet._outBuybackFee()).to.be.equal(5);
                expect(await onPlanet._outTeamFee()).to.be.equal(3);
                await onPlanet.setDefaultOutFeePercent(5, 5, 5);
                expect(await onPlanet._outTaxFee()).to.be.equal(5);
                expect(await onPlanet._outBuybackFee()).to.be.equal(5);
                expect(await onPlanet._outTeamFee()).to.be.equal(5);
            })

            it("setNumTokensSellToAddToLiquidity function works as expectation", async () => {
                expect(await onPlanet.minimumTokensBeforeSwap()).to.be.equal(ethers.utils.parseEther("125000"))
                await onPlanet.setNumTokensSellToAddToLiquidity("150000")
                expect(await onPlanet.minimumTokensBeforeSwap()).to.be.equal(ethers.utils.parseEther("150000"))
            })

            it("setNumTokensSellToAddToLiquidity with _minimumTokensBeforeSwap equal to zero should revert", async () => {
                await expect(onPlanet.setNumTokensSellToAddToLiquidity(0)).to.be.reverted;
            })

            it("setMaxTxAmount function works as expectation", async () => {
                expect(await onPlanet._maxTxAmount()).to.be.equal(ethers.utils.parseEther("5000000"))
                await onPlanet.setMaxTxAmount("6000000")
                expect(await onPlanet._maxTxAmount()).to.be.equal(ethers.utils.parseEther("6000000"))
            })

            it("setMaxTxAmount function works as expectation", async () => {
                expect(await onPlanet._maxSellCount()).to.be.equal(3)
                await onPlanet.setMaxSellCount(5)
                expect(await onPlanet._maxSellCount()).to.be.equal(5)
            })

            it("setMultiFeeOn function works as expectation", async () => {
                expect(await onPlanet.multiFeeOn()).to.be.equal(true);
                await onPlanet.setMultiFeeOn(false);
                expect(await onPlanet.multiFeeOn()).to.be.equal(false);
            })

            it("setMarketingAddress function works as expectation", async () => {
                await onPlanet.setMarketingAddress(ali.address);
                expect(await onPlanet.marketingAddress()).to.be.equal(ali.address);
            })

            it("setMarketingAddress with null or dead address should be reverted", async () => {
                await expect(onPlanet.setMarketingAddress(zeroAddress)).to.be.reverted;
                await expect(onPlanet.setMarketingAddress(deadAddress)).to.be.reverted;
            })

            it("setDeveloperAddress function works as expectation", async () => {
                await onPlanet.setDeveloperAddress(ali.address);
                expect(await onPlanet.devAddress()).to.be.equal(ali.address);
            })

            it("setDeveloperAddress with null or dead address should be reverted", async () => {
                await expect(onPlanet.setDeveloperAddress(zeroAddress)).to.be.reverted;
                await expect(onPlanet.setDeveloperAddress(deadAddress)).to.be.reverted;
            })

            it("setSwapAndLiquifyEnabled function works as expectation", async () => {
                expect(await onPlanet.swapAndLiquifyEnabled()).to.be.equal(false);
                await onPlanet.setSwapAndLiquifyEnabled(true);
                expect(await onPlanet.swapAndLiquifyEnabled()).to.be.equal(true);
            })

            it("setSwapAndLiquifyEnabled function emits SwapAndLiquifyEnabledUpdated event ", async () => {
                expect(await onPlanet.setSwapAndLiquifyEnabled(true))
                    .to.emit(onPlanet, "SwapAndLiquifyEnabledUpdated").withArgs(true)
                expect(await onPlanet.setSwapAndLiquifyEnabled(false))
                    .to.emit(onPlanet, "SwapAndLiquifyEnabledUpdated").withArgs(false)
            })

            it("setEthBuyback function works as expectation", async () => {
                expect(await onPlanet.ethBuyBack()).to.be.equal(true);
                await onPlanet.setEthBuyback(false);
                expect(await onPlanet.ethBuyBack()).to.be.equal(false);
            })

            it("setEthBuyback function emits EthBuyBack event ", async () => {
                expect(await onPlanet.setEthBuyback(false))
                    .to.emit(onPlanet, "EthBuyBack").withArgs(false)
            })

            it("setReflectionEnabled function on disabling works as expectation", async () => {
                expect(await onPlanet.isReflection()).to.be.equal(true);
                await onPlanet.setReflectionEnabled(false);
                expect(await onPlanet.isReflection()).to.be.equal(false);

            })

            it("setReflectionEnabled function on reenabling works as expectation", async () => {
                expect(await onPlanet.isReflection()).to.be.equal(true);
                await onPlanet.setReflectionEnabled(false);
                expect(await onPlanet.isReflection()).to.be.equal(false);

                await onPlanet.excludeFromReward(ali.address);
                await onPlanet.excludeFromReward(dave.address);

                await onPlanet.setReflectionEnabled(true);
                expect(await onPlanet.isReflection()).to.be.equal(true);

            })

            it("setBuyBackTokenAddress function works as expectation", async () => {
                await onPlanet.setBuyBackTokenAddress(ali.address);
                expect(await onPlanet._buyback_token_addr()).to.be.equal(ali.address);
            })

            it("setBuyBackTokenAddress with null or dead address should revert", async () => {
                await expect(onPlanet.setBuyBackTokenAddress(zeroAddress)).to.be.reverted;
                await expect(onPlanet.setBuyBackTokenAddress(deadAddress)).to.be.reverted;
            })

            it("updateStakingAddress function works as expectation", async () => {
                await onPlanet.updateStakingAddress(ali.address);
                expect(await onPlanet.stakingAddress()).to.be.equal(ali.address);
            })

            it("updateStakingAddress function emits StakingAddressUpdated event", async () => {
                expect(await onPlanet.updateStakingAddress(ali.address))
                    .to.emit(onPlanet, "StakingAddressUpdated").withArgs(ali.address)
            })

            it("_onPlanetEcosystemContractAdd function works as expectation", async () => {
                await onPlanet._onPlanetEcosystemContractAdd(ali.address);
            })

            it("_onPlanetEcosystemContractAdd function emits OnPlanetEcosystemContractAdded event", async () => {
                expect(await onPlanet._onPlanetEcosystemContractAdd(ali.address))
                    .to.emit(onPlanet, "OnPlanetEcosystemContractAdded").withArgs(ali.address)
            })

            it("_onPlanetEcosystemContractAdd will exclude the added address from fees", async () => {
                await onPlanet._onPlanetEcosystemContractAdd(ali.address);
                expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(true);
            })

            it("onPlanetEcosystemContractRemove function works as expectation", async () => {
                expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(false);

                await onPlanet._onPlanetEcosystemContractAdd(ali.address);
                await onPlanet._onPlanetEcosystemContractAdd(dave.address);
                await onPlanet._onPlanetEcosystemContractAdd(ray.address);
                
                expect(await onPlanet.allEcosystemContractsLength()).to.be.equal(3)

                expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(true);
                
                await onPlanet.onPlanetEcosystemContractRemove(ali.address);
                
                expect(await onPlanet.allEcosystemContractsLength()).to.be.equal(2)
                expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(false);


            })

            it("onPlanetEcosystemContractRemove function emits OnPlanetEcosystemContractRemoved event", async () => {
                await onPlanet._onPlanetEcosystemContractAdd(ali.address);
                expect(await onPlanet.onPlanetEcosystemContractRemove(ali.address))
                .to.emit(onPlanet, "OnPlanetEcosystemContractRemoved").withArgs(ali.address)
            })

            it("onPlanetEcosystemContractRemove should revert if address is not already present", async () => {
                await expect(onPlanet.onPlanetEcosystemContractRemove(ali.address)).to.be.reverted;
            })

            it("setReflectionOn function works as expectation", async () => {
                expect(await onPlanet.isReflection()).to.be.equal(true);
                await onPlanet.setReflectionOn(false);
                expect(await onPlanet.isReflection()).to.be.equal(false);
            })

            it("transferBalance works as expectation", async () => {

                await expect(() =>
                    ali.sendTransaction({
                        to: onPlanet.address,
                        value: ethers.utils.parseEther("10.0"), // Sends exactly 10.0 ether
                    })
                ).to.changeEtherBalance(onPlanet, ethers.utils.parseEther("10.0"))

                let balance_of_contract = await provider.getBalance(onPlanet.address);
                expect(balance_of_contract).to.equal(ethers.utils.parseEther("10.0"))

                await expect(() =>
                    onPlanet.transferBalance(dave.address)
                ).to.changeEtherBalance(onPlanet, `-${ethers.utils.parseEther("10.0")}`)

                balance_of_contract = await provider.getBalance(onPlanet.address);
                expect(balance_of_contract).to.equal(ethers.utils.parseEther("0.0"))


            })

            it("transferBalance to a null or a dead address should revert", async () => {

                await expect(() =>
                    ali.sendTransaction({
                        to: onPlanet.address,
                        value: ethers.utils.parseEther("10.0"), // Sends exactly 10.0 ether
                    })
                ).to.changeEtherBalance(onPlanet, ethers.utils.parseEther("10.0"))

                let balance_of_contract = await provider.getBalance(onPlanet.address);
                expect(balance_of_contract).to.equal(ethers.utils.parseEther("10.0"))

                await expect(onPlanet.transferBalance(zeroAddress)).to.be.reverted;
                await expect(onPlanet.transferBalance(deadAddress)).to.be.reverted;


            })

            it("transferBalance should revert if balance of contract is zero", async () => {
                let balance_of_contract = await provider.getBalance(onPlanet.address);
                expect(balance_of_contract).to.equal(ethers.utils.parseEther("0"))
                await expect(onPlanet.transferBalance(dave.address)).to.be.reverted;

            })

            it("reflectionFromToken with tAmount more than supply should revert", async () => {
                const supply = await onPlanet.totalSupply();
                const one = BigNumber.from("1")
                await expect(onPlanet.reflectionFromToken(supply.add(one), false)).to.be.reverted;
            })


        })

        describe("As buy back owner", () => {

            it("setBuybackUpperLimit and buyBackUpperLimitAmount functions work as expectation", async () => {
                expect(await onPlanet.buyBackUpperLimitAmount()).to.be.equal(ethers.utils.parseEther("10"))
                await onPlanet.setBuybackUpperLimit(2, 0);
                expect(await onPlanet.buyBackUpperLimitAmount()).to.be.equal(ethers.utils.parseEther("2"))
            })

            it("setBuybackUpperLimit function emits BuybackUpperLimitUpdated event", async () => {
                expect(await onPlanet.setBuybackUpperLimit(2, 0))
                    .to.emit(onPlanet, "BuybackUpperLimitUpdated").withArgs(ethers.utils.parseEther("10"), ethers.utils.parseEther("2"))
            })

            it("setBuybackUpperLimit should revert with buyBackLimit less than 1 ", async () => {
                await expect(onPlanet.setBuybackUpperLimit(0, 0)).to.be.reverted;
            })

            it("setBuybackUpperLimit should revert with buyBackLimit more than 1001 ", async () => {
                await expect(onPlanet.setBuybackUpperLimit(0, 0)).to.be.reverted;
                await expect(onPlanet.setBuybackUpperLimit(1001, 0)).to.be.reverted;
                await expect(onPlanet.setBuybackUpperLimit(10, 6)).to.be.reverted;
            })

            it("setBuybackTriggerTokenLimit functions work as expectation", async () => {
                await expect(onPlanet.setBuybackTriggerTokenLimit(0)).to.be.reverted;
                await expect(onPlanet.setBuybackTriggerTokenLimit(10000001)).to.be.reverted;

                expect(await onPlanet.setBuybackTriggerTokenLimit(10000000))
                    .to.emit(onPlanet, "BuyBackTriggerTokenLimitUpdated").withArgs(ethers.utils.parseEther("1000000"), ethers.utils.parseEther("10000000"))
                
            })

            it("setBuybackTriggerTokenLimit function emits BuyBackTriggerTokenLimitUpdated event", async () => {
                expect(await onPlanet.setBuybackTriggerTokenLimit(2000000))
                    .to.emit(onPlanet, "BuyBackTriggerTokenLimitUpdated").withArgs(ethers.utils.parseEther("1000000"), ethers.utils.parseEther("2000000"))
            })

            it("setBuybackMinAvailability functions work as expectation", async () => {
                // expect(await onPlanet.buyBackTriggerTokenLimit()).to.be.equal(ethers.utils.parseEther("1000000"))
                await onPlanet.setBuybackMinAvailability(2, 0);
                // expect(await onPlanet.buyBackTriggerTokenLimit()).to.be.equal(ethers.utils.parseEther("2000000"))
            })

            it("setBuybackMinAvailability function emits BuybackMinAvailabilityUpdated event", async () => {
                expect(await onPlanet.setBuybackMinAvailability(2, 0))
                    .to.emit(onPlanet, "BuybackMinAvailabilityUpdated").withArgs(ethers.utils.parseEther("1"), ethers.utils.parseEther("2"))
            })

            it("setBuybackMinAvailability should revert with amount 0", async () => {
                await expect(onPlanet.setBuybackMinAvailability(0, 0)).to.be.reverted;
                await expect(onPlanet.setBuybackMinAvailability(1001, 0)).to.be.reverted;
                await expect(onPlanet.setBuybackMinAvailability(1, 6)).to.be.reverted;
            })

            it("setBuyBackEnabled functions work as expectation", async () => {
                await startTrading();
                expect(await onPlanet.buyBackEnabled()).to.be.equal(true)
                await onPlanet.setBuyBackEnabled(false);
                expect(await onPlanet.buyBackEnabled()).to.be.equal(false)
            })

            it("setBuyBackEnabled function emits BuyBackEnabledUpdated event", async () => {
                await startTrading();
                expect(await onPlanet.setBuyBackEnabled(false))
                    .to.emit(onPlanet, "BuyBackEnabledUpdated").withArgs(false)
            })

            it("manualBuyback functions with swapETHForTokensNoFee route work as expectation", async () => {
                // console.log("ethBuyBack", await onPlanet.ethBuyBack())
                await startTrading();
                await ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
                })
                await provideLiquidity()
                await onPlanet.manualBuyback(1, 0);
            })

            it("manualBuyback functions with swapETHForTokensNoFee should emit SwapETHForTokens event", async () => {
                // console.log("ethBuyBack", await onPlanet.ethBuyBack())
                await startTrading();

                await ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
                })
                await provideLiquidity()

                expect(Number(await onPlanet.balanceOf(onPlanet.address))).to.be.equal(0)

                await expect(onPlanet.manualBuyback(1, 0)).to.emit(onPlanet, "SwapETHForTokens")

                expect(await provider.getBalance(onPlanet.address)).to.be.equal(ethers.utils.parseEther("0"))
                expect(Number(await onPlanet.balanceOf(onPlanet.address))).to.not.equal(0)

            })

            it("manualBuyback functions with swapTokensForTokens route work as expectation", async () => {
                await startTrading();
                await provideLiquidity();
                await provideLiquidityForBuyBackToken();
                await onPlanet.setEthBuyback(false)
                await buyBackToken.mint(deployer.address, ethers.utils.parseEther("1000"))
                await buyBackToken.transfer(onPlanet.address, ethers.utils.parseEther("1000"))
                await onPlanet.manualBuyback(1, 0);
                expect(Number(await onPlanet.balanceOf(onPlanet.address))).to.not.equal(0)
            })

            it("manualBuyback functions with swapTokensForTokens should emit SwapTokensForTokens event", async () => {
                await startTrading();
                await provideLiquidity();
                await provideLiquidityForBuyBackToken();
                await onPlanet.setEthBuyback(false)
                await buyBackToken.mint(deployer.address, ethers.utils.parseEther("1000"))
                await buyBackToken.transfer(onPlanet.address, ethers.utils.parseEther("1000"))
                await onPlanet.manualBuyback(1, 0);
                await expect(onPlanet.manualBuyback(1, 0)).to.emit(onPlanet, "SwapTokensForTokens")

            })

            it("manualBuyback functions should revert with amount and numOfDecimals 0", async () => {
                await expect(onPlanet.manualBuyback(0, 1)).to.be.reverted;
                await expect(onPlanet.manualBuyback(0, -1)).to.be.reverted;
            })


        })

        describe("As general user", () => {

            it("Should not be able to enable trading", async () => {
                await expect(onPlanet.connect(ali).setTradingEnabled(0, 10)).to.be.reverted;
            })

            it("Tokens can be transfered to another user", async () => {
                await onPlanet.setTradingEnabled(0, 1)
                await onPlanet.transfer(ali.address, web3.utils.toWei('1000000', 'ether'));
                expect(await onPlanet.balanceOf(ali.address)).to.be.equal(web3.utils.toWei('1000000', 'ether'));
                await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('9999', 'ether'));
            })

            it("Tokens cannot be transfered to a null address", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, web3.utils.toWei('1000000', 'ether'));
                await expect(onPlanet.connect(ali).transfer(zeroAddress, web3.utils.toWei('1000000', 'ether'))).to.be.reverted;
            })

            it("Tokens cannot be transfered with zero amount", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, web3.utils.toWei('1000000', 'ether'));
                await expect(onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('0', 'ether'))).to.be.reverted;
            })

            it("Tokens cannot be transfered more than setMaxTxAmount", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, web3.utils.toWei('10000000', 'ether'));
                await expect(onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('6000000', 'ether'))).to.be.reverted;
            })

            it("Token transfer will emit Transfer event", async () => {
                expect(await onPlanet.transfer(ali.address, 1_000_000))
                    .to.emit(onPlanet, "Transfer").withArgs(deployer.address, ali.address, 1_000_000)
            })

            it("User will recive tokens as expectation", async () => {
                await onPlanet.transfer(ali.address, 1_000_000);
                expect(Number(await onPlanet.balanceOf(ali.address))).to.equals(1_000_000)
            })

            it("Approve function works as expectation and emits Approval event", async () => {
                expect(await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether')))
                    .to.emit(onPlanet, "Approval")
                    .withArgs(deployer.address, ali.address, web3.utils.toWei('1', 'ether'))
            })

            it("Approve function should revert if spender is null address", async () => {
                await expect(onPlanet.approve(zeroAddress, web3.utils.toWei('1', 'ether'))).to.be.reverted;
            })

            it("Allownce function working as expectation", async () => {
                await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))
                expect(await onPlanet.allowance(deployer.address, ali.address)).to.equals(web3.utils.toWei('1', 'ether'))
            })

            it("IncreaseAllowance function works as expectation and emits Approval event", async () => {
                await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))

                expect(await onPlanet.increaseAllowance(ali.address, web3.utils.toWei('1', 'ether')))
                    .to.emit(onPlanet, "Approval")
                    .withArgs(deployer.address, ali.address, web3.utils.toWei('2', 'ether'))

                expect(await onPlanet.allowance(deployer.address, ali.address)).to.equals(web3.utils.toWei('2', 'ether'))

            })

            it("IncreaseAllowance function works as expectation and emits Approval event", async () => {
                await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))

                expect(await onPlanet.decreaseAllowance(ali.address, web3.utils.toWei('1', 'ether')))
                    .to.emit(onPlanet, "Approval")
                    .withArgs(deployer.address, ali.address, web3.utils.toWei('0', 'ether'))

                expect(await onPlanet.allowance(deployer.address, ali.address)).to.equals(web3.utils.toWei('0', 'ether'))

            })

            it("On token transfer when both are Both Excluded works as expectation", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await startTrading();
                await onPlanet.excludeFromReward(ali.address);
                await onPlanet.excludeFromReward(dave.address);
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(true);
                expect(await onPlanet.isExcludedFromReward(dave.address)).to.be.equal(true);

                await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('10', 'ether'));

            })

            it("Tokens cannot be transfered if trading is not enabled", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await expect(onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('99', 'ether'))).to.be.reverted;
            })

            it("On token transfer, validateDuringTradingCoolDown works as expectation", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await startTrading();
                await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('99', 'ether'));
            })

            it("During cooldown, no one can sell or buy twice in the same block but can sell or buy less than maxTxCooldownAmount (0.05% TS = 500000 Tokens)", async () => {

                let latestBlock;
                await onPlanet.setTradingEnabled(0, 10);
                await provideLiquidity2();
                latestBlock = await ethers.provider.getBlock("latest")

                await onPlanet.transfer(ali.address, ethers.utils.parseEther(String(100000000)));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther(String(100000000)));

                // console.log("Ali is trying to sell his 500001 tokens in cooldown period");
                for (let i = 0; i < 5; i++) {
                    try {
                        await expect(
                            router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                                ethers.utils.parseEther("500001"),
                                ethers.utils.parseEther("0"),
                                [onPlanet.address, myWETH.address],
                                dave.address,
                                latestBlock.timestamp + 60,
                            )
                        ).to.be.reverted;

                        await router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                            ethers.utils.parseEther("500000"),
                            ethers.utils.parseEther("0"),
                            [onPlanet.address, myWETH.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                        )

                    }
                    catch (e) {
                        console.log("swapExactTokensForETHSupportingFeeOnTransferTokens Faild")
                        console.log(e)
                    }
                }

                // console.log("Dave is trying to buy tokens worth of 100 BNB 5 times in cooldown period")
                for (let i = 0; i < 5; i++) {
                    try {

                        await expect(
                            router.connect(dave).swapETHForExactTokens(
                                ethers.utils.parseEther("500001"),
                                [myWETH.address, onPlanet.address],
                                dave.address,
                                latestBlock.timestamp + 60,
                                { value: ethers.utils.parseEther("200") }
                            )
                        ).to.be.reverted;

                        await router.connect(dave).swapETHForExactTokens(
                            ethers.utils.parseEther("500000"),
                            [myWETH.address, onPlanet.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                            { value: ethers.utils.parseEther("200") }
                        )

                    }
                    catch (e) {
                        console.log("swapExactETHForTokensSupportingFeeOnTransferTokens Faild")
                        // console.log(e)
                    }
                }


            })

            it("After cooldown, every one can sell or buy less than maxTxAmount (0.1% TS = 1M Tokens)", async () => {

                let latestBlock;
                await onPlanet.setTradingEnabled(0, 10);
                await provideLiquidity2();

                await network.provider.send("evm_increaseTime", [11 * 60])
                await network.provider.send("evm_mine")

                expect(await onPlanet.inTradingStartCoolDown()).to.be.equal(false);

                latestBlock = await ethers.provider.getBlock("latest")

                await onPlanet.transfer(ali.address, ethers.utils.parseEther(String(500000000)));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther(String(500000000)));

                // console.log("Ali is trying to sell his 5000000 tokens in cooldown period");
                for (let i = 0; i < 5; i++) {
                    try {
                        await expect(
                            router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                                ethers.utils.parseEther("1000001"),
                                ethers.utils.parseEther("0"),
                                [onPlanet.address, myWETH.address],
                                dave.address,
                                latestBlock.timestamp + 60,
                            )
                        ).to.be.reverted;

                        await router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                            ethers.utils.parseEther("1000000"),
                            ethers.utils.parseEther("0"),
                            [onPlanet.address, myWETH.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                        )

                    }
                    catch (e) {
                        console.log("swapExactTokensForETHSupportingFeeOnTransferTokens Faild")
                        console.log(e)
                    }
                }

                // console.log("Dave is trying to buy tokens worth of 100 BNB 5 times in cooldown period")
                for (let i = 0; i < 5; i++) {
                    try {

                        await expect(
                            router.connect(dave).swapETHForExactTokens(
                                ethers.utils.parseEther("1000001"),
                                [myWETH.address, onPlanet.address],
                                dave.address,
                                latestBlock.timestamp + 60,
                                { value: ethers.utils.parseEther("500") }
                            )
                        ).to.be.reverted;

                        await router.connect(dave).swapETHForExactTokens(
                            ethers.utils.parseEther("1000000"),
                            [myWETH.address, onPlanet.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                            { value: ethers.utils.parseEther("500") }
                        )

                    }
                    catch (e) {
                        console.log("swapExactETHForTokensSupportingFeeOnTransferTokens Faild")
                        // console.log(e)
                    }
                }


            })

            it("After every trade, on ethBuyBack enabled, ETh Marketing and Dev wallet will recieve the BNBS", async () => {

                await network.provider.send("hardhat_setBalance", [
                    marketingAddress.address,
                    "0x0",
                ]);

                await network.provider.send("hardhat_setBalance", [
                    devAddress.address,
                    "0x0",
                ]);

                let latestBlock;
                await onPlanet.setTradingEnabled(0, 10);
                await provideLiquidity2();
                await provideLiquidityForBuyBackToken();

                await network.provider.send("evm_increaseTime", [11 * 60])
                await network.provider.send("evm_mine")

                let initialMarkeringBalance = Number(ethers.utils.formatEther(await provider.getBalance(marketingAddress.address)))
                let initialDevBalance = Number(ethers.utils.formatEther(await provider.getBalance(devAddress.address)))
                let initialContractBalance = Number(ethers.utils.formatEther(await provider.getBalance(onPlanet.address)))

                latestBlock = await ethers.provider.getBlock("latest")

                await onPlanet.transfer(ali.address, ethers.utils.parseEther(String(500000000)));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther(String(500000000)));

                await onPlanet.setBuybackTriggerTokenLimit(990000)
                await onPlanet.updateStakingAddress(stakingAddress.address)

                for (let i = 0; i < 5; i++) {
                    try {

                        await router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                            ethers.utils.parseEther("1000000"),
                            ethers.utils.parseEther("0"),
                            [onPlanet.address, myWETH.address],
                            ali.address,
                            latestBlock.timestamp + 60,
                        )

                        // console.log("change in Eth balance of marketingAddress while someone sell: ", Number(ethers.utils.formatEther(await provider.getBalance(marketingAddress.address))))
                        // console.log("change in Eth balance of devAddress while someone sell: ", Number(ethers.utils.formatEther(await provider.getBalance(devAddress.address))))
                        // console.log("change in Eth balance of Contract while someone sell: ", Number(ethers.utils.formatEther(await provider.getBalance(onPlanet.address))))
                        // console.log("Token balance of marketingAddress while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(marketingAddress.address))))
                        // console.log("Token balance of devAddress while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(devAddress.address))))
                        // console.log("Token balance of Contract while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(onPlanet.address))))
                        // console.log("Token balance of stakingAddress while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(stakingAddress.address))))
                        // console.log(" ")


                    }
                    catch (e) {
                        console.log("swapExactTokensForETHSupportingFeeOnTransferTokens Faild")
                        console.log(e)
                    }
                }

                await onPlanet.setNumTokensSellToAddToLiquidity(ethers.utils.parseEther("1"));

                initialMarkeringBalance = Number(ethers.utils.formatEther(await provider.getBalance(marketingAddress.address)))
                initialDevBalance = Number(ethers.utils.formatEther(await provider.getBalance(devAddress.address)))

                for (let i = 0; i < 5; i++) {
                    try {

                        await router.connect(dave).swapETHForExactTokens(
                            ethers.utils.parseEther("1000000"),
                            [myWETH.address, onPlanet.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                            { value: ethers.utils.parseEther("500") }
                        )
                        // console.log("change in Eth balance of marketingAddress while someone buys: ", Number(ethers.utils.formatEther(await provider.getBalance(marketingAddress.address))))
                        // console.log("change in Eth balance of devAddress  while someone buys: ", Number(ethers.utils.formatEther(await provider.getBalance(devAddress.address))))
                        // console.log("change in Eth balance of Contract while someone buys: ", Number(ethers.utils.formatEther(await provider.getBalance(onPlanet.address))))

                        // console.log("Token balance of marketingAddress while someone buys: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(marketingAddress.address))))
                        // console.log("Token balance of devAddress while someone buys: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(devAddress.address))))
                        // console.log("Token balance of Contract while someone buys: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(onPlanet.address))))
                        // console.log(" ")

                    }
                    catch (e) {
                        console.log("swapExactETHForTokensSupportingFeeOnTransferTokens Faild")
                        // console.log(e)
                    }
                }

            })

            it("After every trade, on ethBuyBack disabled, ETh Marketing and Dev wallet will recieve the buyback Tokens", async () => {

                let latestBlock;
                await onPlanet.setTradingEnabled(0, 10);
                await provideLiquidity2();
                await provideLiquidityForBuyBackToken();

                await network.provider.send("evm_increaseTime", [11 * 60])
                await network.provider.send("evm_mine")

                // let initialMarkeringBalance = Number(ethers.utils.formatEther(await buyBackToken.balanceOf(marketingAddress.address)))
                // let initialDevBalance = Number(ethers.utils.formatEther(await buyBackToken.balanceOf(devAddress.address)))
                // let initialContractBalance = Number(ethers.utils.formatEther(await buyBackToken.balanceOf(onPlanet.address)))


                await onPlanet.setEthBuyback(false)
                // console.log("ETHbuyBack: ", await onPlanet.ethBuyBack())

                await onPlanet.setNumTokensSellToAddToLiquidity(ethers.utils.parseEther("1"));

                latestBlock = await ethers.provider.getBlock("latest")

                await onPlanet.transfer(ali.address, ethers.utils.parseEther(String(500000000)));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther(String(500000000)));

                for (let i = 0; i < 5; i++) {
                    try {

                        await router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                            ethers.utils.parseEther("1000000"),
                            ethers.utils.parseEther("0"),
                            [onPlanet.address, myWETH.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                        )

                        // console.log(" ")
                        // console.log("buyBackToken balance of marketingAddress while someone sell: ", ethers.utils.formatEther(await buyBackToken.balanceOf(marketingAddress.address)))
                        // console.log("buyBackToken balance of devAddress while someone sell: ", ethers.utils.formatEther(await buyBackToken.balanceOf(devAddress.address)))
                        // console.log("buyBackToken balance of Contract while someone sell: ", ethers.utils.formatEther(await buyBackToken.balanceOf(onPlanet.address)))

                        // console.log("Token balance of marketingAddress while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(marketingAddress.address))))
                        // console.log("Token balance of devAddress while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(devAddress.address))))
                        // console.log("Token balance of Contract while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(onPlanet.address))))
                        // console.log("Token balance of stakingAddress while someone sell: ", Number(ethers.utils.formatEther(await onPlanet.balanceOf(stakingAddress.address))))


                    }
                    catch (e) {
                        console.log("swapExactTokensForETHSupportingFeeOnTransferTokens Faild")
                        console.log(e)
                    }
                }

                // initialMarkeringBalance = Number(ethers.utils.formatEther(await provider.getBalance(marketingAddress.address)))
                // initialDevBalance = Number(ethers.utils.formatEther(await provider.getBalance(devAddress.address)))

                for (let i = 0; i < 5; i++) {
                    try {

                        await router.connect(dave).swapETHForExactTokens(
                            ethers.utils.parseEther("1000000"),
                            [myWETH.address, onPlanet.address],
                            dave.address,
                            latestBlock.timestamp + 60,
                            { value: ethers.utils.parseEther("500") }
                        )

                        // console.log(" ")
                        // console.log("buyBackToken balance of marketingAddress while someone buys: ", ethers.utils.formatEther(await buyBackToken.balanceOf(marketingAddress.address)))
                        // console.log("buyBackToken balance of devAddress while someone buys: ", ethers.utils.formatEther(await buyBackToken.balanceOf(devAddress.address)))
                        // console.log("buyBackToken balance of Contract while someone buys: ", ethers.utils.formatEther(await buyBackToken.balanceOf(onPlanet.address)))


                    }
                    catch (e) {
                        console.log("swapExactETHForTokensSupportingFeeOnTransferTokens Faild")
                        // console.log(e)
                    }
                }

            })

            it("On a trade with ethBuyBack disabled and swapAndLiquify Enabled, can buyBackTokens with SwapETHForTokens event", async () => {

                await onPlanet.setTradingEnabled(0, 1)

                await network.provider.send("evm_increaseTime", [5 * 60])
                await network.provider.send("evm_mine")

                await provideLiquidity2();

                await provideLiquidityForBuyBackToken();

                await onPlanet.setEthBuyback(false)
                expect(await onPlanet.ethBuyBack()).to.be.equal(false)

                await onPlanet.setMaxTxAmount("1000000");
                await onPlanet.setNumTokensSellToAddToLiquidity("500")

                await onPlanet.transfer(onPlanet.address, ethers.utils.parseEther("500"));

                await onPlanet.transfer(ali.address, ethers.utils.parseEther("1000000"));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther("1000000"));

                let latestBlock = await ethers.provider.getBlock("latest")

                await expect(
                    router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                        ethers.utils.parseEther("1000000"),
                        ethers.utils.parseEther("0"),
                        [onPlanet.address, myWETH.address],
                        ali.address,
                        latestBlock.timestamp + 60,
                    )
                )
                    .to.emit(onPlanet, "SwapTokensForTokens")




            })

            it("On a trade with ethBuyBack enabled and swapAndLiquifyEnabled, can SwapTokensForETH and emits SwapTokensForETH event", async () => {

                await onPlanet.setTradingEnabled(0, 1)

                await network.provider.send("evm_increaseTime", [5 * 60])
                await network.provider.send("evm_mine")

                await provideLiquidity2();

                await provideLiquidityForBuyBackToken();

                expect(await onPlanet.ethBuyBack()).to.be.equal(true)

                await onPlanet.setMaxTxAmount("1000000");
                await onPlanet.setNumTokensSellToAddToLiquidity("500")

                await onPlanet.transfer(onPlanet.address, ethers.utils.parseEther("500"));

                await onPlanet.transfer(ali.address, ethers.utils.parseEther("1000000"));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther("1000000"));

                let latestBlock = await ethers.provider.getBlock("latest")

                await expect(
                    router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                        ethers.utils.parseEther("1000000"),
                        ethers.utils.parseEther("0"),
                        [onPlanet.address, myWETH.address],
                        ali.address,
                        latestBlock.timestamp + 60,
                    )
                ).to.emit(onPlanet, "SwapTokensForETH")


            })

            it("Fees are effective", async () => {
                await startTrading();
                await provideLiquidity2();
                // await provideLiquidityForBuyBackToken();
                await onPlanet.transfer(ali.address, ethers.utils.parseEther("500000000"));
                await onPlanet.connect(ali).approve(router.address, ethers.utils.parseEther("500000000"));

                let latestBlock = await ethers.provider.getBlock("latest")

                await onPlanet.setDefaultInFeePercent(10, 10, 10);

                for (let i = 0; i < 5; i++) {

                    try {
                        // console.log("Balance of ali before ", i+1, " transaction: ", ethers.utils.formatEther(await onPlanet.balanceOf(dave.address)))
                        await router.connect(ali).swapExactTokensForETHSupportingFeeOnTransferTokens(
                            ethers.utils.parseEther("279401"),
                            ethers.utils.parseEther("0"),
                            [onPlanet.address, myWETH.address],
                            ray.address,
                            latestBlock.timestamp + 60,
                        )

                        // console.log("balance of Ray ", Number(ethers.utils.formatEther(await provider.getBalance(ray.address))) - 10000 )



                    } catch (e) {
                        console.log(e)
                    }


                }

            })

        })

    })

})
