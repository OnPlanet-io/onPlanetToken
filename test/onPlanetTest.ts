/*
Requirements to pass all tests

-    Set buyBackTriggerVolume as uint256 private buyBackTriggerVolume = 100 * 10**(_decimals-1);

-    change constructor() to constructor(address _local_uniswapV2Router, address buyback_token_addr, address _devAddress, address _marketingAddress) {

-   add these statements inside contructor
    - devAddress = payable(_devAddress);
    - marketingAddress = payable(_marketingAddress);
    - IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(_local_uniswapV2Router); //Local network
    - _buyback_token_addr = buyback_token_addr;
    - buyBackTriggerVolume = 100 * 10**(_decimals-1);

-   Inside the node_modules/@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol
    replace the paiFor function with this one
    
    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        pair = IUniswapV2Factory(factory).getPair(token0,token1);
    }
*/

const { expect } = require('chai');
const { time } = require('@openzeppelin/test-helpers');
import { network } from "hardhat";

const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { BEP20, BEP20__factory, OnPlanet, OnPlanet__factory, UniswapV2Factory, UniswapV2Factory__factory, UniswapV2Pair, UniswapV2Pair__factory, UniswapV2Router02, UniswapV2Router02__factory, WETH9, WETH9__factory } from "../typechain-types";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const deadAddress = "0x000000000000000000000000000000000000dEaD";
const stakingAddress = "0x000000000000000000000000000000000000dEaD";


const overrides = {
    gasLimit: 9999999
}

let deployer: SignerWithAddress, ali: SignerWithAddress, dave: SignerWithAddress, devAddress: SignerWithAddress, marketingAddress:SignerWithAddress;

let onPlanet: OnPlanet;
let buyBackToken: BEP20;
let myWETH: WETH9, factory: UniswapV2Factory, router: UniswapV2Router02, uniswapV2Pair: UniswapV2Pair;

describe('onPlanet Test Stack', () => {

    beforeEach(async () => {

        [deployer, ali, dave, devAddress, marketingAddress] = await ethers.getSigners();

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
        router = await UniswapV2Router02.attach(router.address);

        const uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address);
        uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress);

    });

    const startTrading = async () => {
        const OneMinute = Number(await time.duration.minutes(1));
        
        await onPlanet.setTradingEnabled(5, 10)

        await network.provider.send("evm_increaseTime", [5*OneMinute])
        await network.provider.send("evm_mine")
    }

    const provideLiquidity = async () => {
        let latestBlock = await ethers.provider.getBlock("latest")
        // const fiveMinutesDuration = Number(await time.duration.minutes(5));

        await onPlanet.approve( router.address, ethers.utils.parseEther("5000") )
        await router.addLiquidityETH(
                onPlanet.address,
                ethers.utils.parseEther("5000"),
                0,
                0,
                deployer.address,
                latestBlock.timestamp + 60,
                { value: ethers.utils.parseEther("50") }
        )
        // console.log("Liquidity for OnPlanet and WETH provided")

    }

    const provideLiquidityForBuyBackToken = async () => {
        let latestBlock = await ethers.provider.getBlock("latest")
        // const fiveMinutesDuration = Number(await time.duration.minutes(5));

        await buyBackToken.mint(ali.address, ethers.utils.parseEther("5000000"))
        await buyBackToken.connect(ali).approve( router.address, ethers.utils.parseEther("5000000") )
        await router.connect(ali).addLiquidityETH(
                buyBackToken.address,
                ethers.utils.parseEther("5000"),
                0,
                0,
                deployer.address,
                latestBlock.timestamp + 60,
                { value: ethers.utils.parseEther("50") }
        )
        // console.log("Liquidity for buyBackToken and WETH provided")
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

            // await expect(onPlanet.inTradingStartCoolDown()).to.be.reverted;

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

                await network.provider.send("evm_increaseTime", [5*OneMinute])
                await network.provider.send("evm_mine")
          
                expect(await onPlanet.isTradingEnabled()).to.equals(false); 

                await network.provider.send("evm_increaseTime", [3*OneMinute])
                await network.provider.send("evm_mine")

                expect(await onPlanet.isTradingEnabled()).to.equals(false); 

                await network.provider.send("evm_increaseTime", [1*OneMinute])
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
                
                expect( await onPlanet.inTradingStartCoolDown()).to.be.equal(true)
                await onPlanet.setTradingEnabled(0, 10)                
                expect( await onPlanet.inTradingStartCoolDown()).to.be.equal(true)       

                await network.provider.send("evm_increaseTime", [11*60])
                await network.provider.send("evm_mine")
          
                expect( await onPlanet.inTradingStartCoolDown()).to.be.equal(false)             
            
            })

            it("before tradingStartCooldown period elapsed, No user will be able to dump tokens", async () => {
                
                expect( await onPlanet.inTradingStartCoolDown()).to.be.equal(true);
                await onPlanet.setTradingEnabled(0, 10);


                // const fiveMinutesDuration = Number(await time.duration.minutes(5));
                await onPlanet.transfer(ali.address, ethers.utils.parseEther("5000"));
                


                let latestBlock = await ethers.provider.getBlock("latest")

                await onPlanet.connect(ali).approve( router.address, ethers.utils.parseEther("5000") );
                await expect( 
                    router.connect(ali).addLiquidityETH(
                        onPlanet.address,
                        ethers.utils.parseEther("5000"),
                        0,
                        0,
                        deployer.address,
                        latestBlock.timestamp + 60,
                        { value: ethers.utils.parseEther("50") }
                )
                ).to.be.reverted;


                await onPlanet.approve( router.address, ethers.utils.parseEther("5000") );
                await router.addLiquidityETH(
                        onPlanet.address,
                        ethers.utils.parseEther("5000"),
                        0,
                        0,
                        deployer.address,
                        latestBlock.timestamp + 60,
                        { value: ethers.utils.parseEther("50") }
                )


                // latestBlock = await ethers.provider.getBlock("latest")
                // await network.provider.send("evm_increaseTime", [11*60])
                // await network.provider.send("evm_mine")

                // expect( await onPlanet.inTradingStartCoolDown()).to.be.equal(false)    
                console.log(await onPlanet.inTradingStartCoolDown())         


                latestBlock = await ethers.provider.getBlock("latest")

                await router.connect(ali).swapETHForExactTokens (
                    ethers.utils.parseEther("400"),
                    [myWETH.address, onPlanet.address],
                    ali.address,
                    latestBlock.timestamp + 60,
                    { value: ethers.utils.parseEther("6") }
            )

            
            })


            it("Owner can transfer Tokens without paying tax", async () => {
                // await startTrading();
                await onPlanet.transfer(ali.address, 1_000_000)
                expect(Number(await onPlanet.balanceOf(ali.address))).to.equals(1_000_000)

            })

            it("Owner can transfer Tokens more than _maxTxAmount", async () => {
                // await startTrading();
                await onPlanet.transfer(ali.address, web3.utils.toWei('6000000', 'ether'));
                // console.log()
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
                // await onPlanet.excludeFromReward(ali.address)
                // expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(true)
                await expect(onPlanet.includeInReward(ali.address)).to.be.reverted;
                // expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(false)
            })

            it("setBotAddress function works as expectation", async () => {
                await startTrading();
                await onPlanet.setBotAddress(ali.address, true);
            })

            it("A bot cannot recieve tokens", async () => {
                await startTrading();
                await onPlanet.setBotAddress(ali.address, true);
                await expect(onPlanet.transfer(ali.address, 1_000_000)).to.be.revertedWith(
                    "VM Exception while processing transaction: reverted with reason string 'ERR: banned transfer'"
                )
            })

            it("A bot cannot send tokens", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, 1_000_000);
                await onPlanet.setBotAddress(ali.address, true);
                await expect(onPlanet.connect(ali).transfer(dave.address, 1_000_000)).to.be.revertedWith(
                    "VM Exception while processing transaction: reverted with reason string 'ERR: banned transfer'"
                )
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
                await onPlanet.setNumTokensSellToAddToLiquidity(ethers.utils.parseEther("150000"))
                expect(await onPlanet.minimumTokensBeforeSwap()).to.be.equal(ethers.utils.parseEther("150000"))
            })

            it("setNumTokensSellToAddToLiquidity with _minimumTokensBeforeSwap equal to zero should revert", async () => {
                await expect(onPlanet.setNumTokensSellToAddToLiquidity(0)).to.be.reverted;
            })

            it("setMaxTxAmount function works as expectation", async () => {
                expect(await onPlanet._maxTxAmount()).to.be.equal(ethers.utils.parseEther("5000000"))
                await onPlanet.setMaxTxAmount(ethers.utils.parseEther("6000000"))
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
                await expect(await onPlanet.isExcludedFromFee(ali.address)).to.be.equal(true);
            })

            it("onPlanetEcosystemContractRemove function works as expectation", async () => {
                await onPlanet._onPlanetEcosystemContractAdd(ali.address);
                await onPlanet.onPlanetEcosystemContractRemove(ali.address);
                // await onPlanet._onPlanetEcosystemContractAdd(dave.address);
                // console.log("@ 0: ", await onPlanet.allEcosystemContracts(0))
                // console.log("@ 1: ", await onPlanet.allEcosystemContracts(1))
                // console.log("@ 0: ", await onPlanet.allEcosystemContracts(0))
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
                await expect(onPlanet.setBuybackTriggerTokenLimit(ethers.utils.parseEther("0"))).to.be.reverted;
                await expect(onPlanet.setBuybackTriggerTokenLimit(ethers.utils.parseEther("20000000000000000000"))).to.be.reverted;
                await onPlanet.setBuybackTriggerTokenLimit(ethers.utils.parseEther("2000000"));
                // expect(await onPlanet.buyBackTriggerTokenLimit()).to.be.equal(ethers.utils.parseEther("2000000"))
            })

            it("setBuybackTriggerTokenLimit function emits BuyBackTriggerTokenLimitUpdated event", async () => {
                expect(await onPlanet.setBuybackTriggerTokenLimit(ethers.utils.parseEther("2000000")))
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

            // Importat -> BUG
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
                await onPlanet.manualBuyback(1,0);
            })

            it("manualBuyback functions with swapETHForTokensNoFee should emit SwapETHForTokens event", async () => {
                // console.log("ethBuyBack", await onPlanet.ethBuyBack())
                await startTrading();
                await ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
                })
                await provideLiquidity()
                await expect(onPlanet.manualBuyback(1,0)).to.emit(onPlanet, "SwapETHForTokens")
                expect(await provider.getBalance(onPlanet.address)).to.be.equal(ethers.utils.parseEther("0"))
                expect(Number(await onPlanet.balanceOf(onPlanet.address))).to.not.equal(0)

            }) 

            it("manualBuyback functions with swapTokensForTokens route work as expectation", async () => {
                await startTrading();
                await provideLiquidity();
                await provideLiquidityForBuyBackToken();
                await onPlanet.setEthBuyback(false)
                await buyBackToken.mint(deployer.address, ethers.utils.parseEther("1000") )
                await buyBackToken.transfer(onPlanet.address, ethers.utils.parseEther("1000") )                
                await onPlanet.manualBuyback(1,0);
                expect(Number(await onPlanet.balanceOf(onPlanet.address))).to.not.equal(0)
            }) 

            it("manualBuyback functions with swapTokensForTokens should emit SwapTokensForTokens event", async () => {
                await startTrading();
                await provideLiquidity();
                await provideLiquidityForBuyBackToken();
                await onPlanet.setEthBuyback(false)
                await buyBackToken.mint(deployer.address, ethers.utils.parseEther("1000") )
                await buyBackToken.transfer(onPlanet.address, ethers.utils.parseEther("1000") )                
                await onPlanet.manualBuyback(1,0);
                await expect(onPlanet.manualBuyback(1,0)).to.emit(onPlanet, "SwapTokensForTokens")

            }) 

            it("manualBuyback functions should revert with amount and numOfDecimals 0", async () => {
                await expect( onPlanet.manualBuyback(0,1)).to.be.reverted;
                await expect( onPlanet.manualBuyback(0,-1)).to.be.reverted;
            }) 
 

        })

        describe("As general user", () => {

            it("Should not be able to enable trading", async () => {
                await expect(onPlanet.connect(ali).setTradingEnabled(0, 10)).to.be.reverted;
            })
    
            it("Tokens can be transfered to another user", async () => {
                await onPlanet.setTradingEnabled(0,1)
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
                // await startTrading();
                expect(await onPlanet.transfer(ali.address, 1_000_000))
                    .to.emit(onPlanet, "Transfer").withArgs(deployer.address, ali.address, 1_000_000)
            })
    
            it("User will recive tokens as expectation", async () => {
                // await startTrading();
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
                // console.log("is trading started? ", await onPlanet.isTradingEnabled() )
                await onPlanet.excludeFromReward(ali.address);
                await onPlanet.excludeFromReward(dave.address);
                // console.log("is ali isExcludedFromFee? ", await onPlanet.isExcludedFromFee(ali.address) )
                // console.log("is dave isExcludedFromFee? ", await onPlanet.isExcludedFromFee(dave.address) )
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(true);
                expect(await onPlanet.isExcludedFromReward(dave.address)).to.be.equal(true);
                // console.log("is ali isExcludedFromReward? ", await onPlanet.isExcludedFromReward(ali.address) )
                // console.log("is dave isExcludedFromReward? ", await onPlanet.isExcludedFromReward(dave.address) )
    
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
    
            it("On token transfer to uniswapV2Pair, with ethBuyBack enabled and swapAndLiquifyEnabled, can SwapTokensForETH and emits SwapTokensForETH event", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await startTrading();
                await provideLiquidity();  
    
                // console.log("is trading started? ", await onPlanet.isTradingEnabled() )
                await ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("100.0"), // Sends exactly 100.0 ether
                })
                await onPlanet.transfer(onPlanet.address, web3.utils.toWei('1250000', 'ether'));
                // console.log("ethBuyBack: ", await onPlanet.ethBuyBack())
                expect(await onPlanet.ethBuyBack()).to.be.equal(true)
                
                await expect(onPlanet.transfer(uniswapV2Pair.address, web3.utils.toWei('125000000', 'ether')))
                .to.emit(onPlanet, "SwapTokensForETH")
            
                // console.log("marketing balance ", String(await provider.getBalance(marketingAddress.address)))
                // console.log("dev balance ", String(await provider.getBalance(devAddress.address)))
            })
    
            it("On token transfer to uniswapV2Pair, with ethBuyBack disabled and swapAndLiquifyEnabled, can swapTokensForTokens and SwapTokensForTokens event", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await startTrading();
    
                await provideLiquidity();
                await provideLiquidity();
                await provideLiquidityForBuyBackToken();
                await ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("500.0")
                })            
                await onPlanet.setEthBuyback(false)
                expect(await onPlanet.ethBuyBack()).to.be.equal(false)          
                
                await onPlanet.transfer(onPlanet.address, web3.utils.toWei('12500000', 'ether'));
                await expect(onPlanet.transfer(uniswapV2Pair.address, web3.utils.toWei('125000000', 'ether')))
                .to.emit(onPlanet, "SwapTokensForTokens")        
       
                // console.log("marketing buyBackToken balance ", String(await buyBackToken.balanceOf(marketingAddress.address)))
                // console.log("dev buyBackToken balance ", String(await buyBackToken.balanceOf(devAddress.address)))
    
            })
    
            it("On token transfer to uniswapV2Pair, with ethBuyBack disabled and swapAndLiquifyEnabled, can buyBackTokens with SwapETHForTokens event", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await startTrading();
                await provideLiquidity();
                await provideLiquidityForBuyBackToken();
                await ali.sendTransaction({
                    to: onPlanet.address,
                    value: ethers.utils.parseEther("500.0")
                })
    
                await onPlanet.setEthBuyback(false)
                expect(await onPlanet.ethBuyBack()).to.be.equal(false)
    
                await onPlanet.transfer(uniswapV2Pair.address, web3.utils.toWei('12500000', 'ether'));
                await expect(onPlanet.transfer(uniswapV2Pair.address, web3.utils.toWei('125000000', 'ether')))
                .to.emit(onPlanet, "SwapETHForTokens")
            })
    
            it("On token transfer to uniswapV2Pair, swapAndLiquify Disabled, ", async () => {
                await onPlanet.transfer(ali.address, web3.utils.toWei('100', 'ether'));
                await startTrading();
                await provideLiquidity();
    
                await onPlanet.setSwapAndLiquifyEnabled(false);
                expect(await await onPlanet.swapAndLiquifyEnabled() ).to.be.equal(false)
    
                await onPlanet.transfer(uniswapV2Pair.address, web3.utils.toWei('10000000', 'ether'));
           
            })
    
        })

    })

})
