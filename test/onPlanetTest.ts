const { assert, expect, use } = require('chai');
const { balance, time } = require('@openzeppelin/test-helpers');

const { ethers, waffle } = require("hardhat");
const provider = waffle.provider;
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { OnPlanet, OnPlanet__factory, UniswapV2FactoryClone, UniswapV2FactoryClone__factory, UniswapV2Router02Clone, UniswapV2Router02Clone__factory, WETH9, WETH9__factory } from "../typechain-types";

const zeroAddress = "0x0000000000000000000000000000000000000000";
const deadAddress = "0x000000000000000000000000000000000000dEaD";
const stakingAddress = "0x000000000000000000000000000000000000dEaD";


const overrides = {
    gasLimit: 9999999
}

let deployer:SignerWithAddress, ali:SignerWithAddress, dave:SignerWithAddress
let onPlanet: OnPlanet, myWETH: WETH9, factory: UniswapV2FactoryClone, router: UniswapV2Router02Clone

describe('onPlanet Test Stack', () => {

    const startTrading = async () => {
        await onPlanet.setTradingEnabled(0, 60)
        await time.increase(time.duration.minutes(1));
    }

    beforeEach(async () => {

        [deployer, ali, dave] = await ethers.getSigners();

        const UniswapV2Factory: UniswapV2FactoryClone__factory = await ethers.getContractFactory("UniswapV2FactoryClone");
        const UniswapV2Router02: UniswapV2Router02Clone__factory = await ethers.getContractFactory('UniswapV2Router02Clone');
        const WETH: WETH9__factory = await ethers.getContractFactory('WETH9');
        const OP: OnPlanet__factory = await ethers.getContractFactory("onPlanet");

        myWETH = await WETH.deploy();
        factory = await UniswapV2Factory.deploy(deployer.address);
        router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides);
        onPlanet = await OP.deploy(router.address);
    });

    describe("After Deployment ", () => {

        it("Contract is deploying fine", async () => {
            // assert.notEqual(onPlanet.address, "");
            expect(onPlanet.address).to.be.properAddress;
        })

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

        it("Assings totalFees as zero", async ()=> {
            expect(Number(await onPlanet.totalFees())).to.equals(0);
        })

        it("Assings tokenFromReflection of 1 token as zero", async ()=> {
            expect(Number(await onPlanet.tokenFromReflection(web3.utils.toWei('1', 'ether')))).to.equals(0);
        })




        it("Trading is disabled", async () => {
            expect(await onPlanet.isTradingEnabled()).to.equals(false);
            await expect(onPlanet.inTradingStartCoolDown()).to.be.reverted;
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

        it('User cannot transfer tokens', async () => {
            await expect(onPlanet.transfer(ali.address, 1000)).to.be.revertedWith(
                "VM Exception while processing transaction: reverted with reason string 'Trading has not started"
            )
        });

        it("reflectionFromToken with fee and without fee should be same", async ()=> {
            expect(Number(await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), true)))
            .to.equals(Number(await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), false)));
        })

    })

    describe("After trading is enables", () => {

        describe("as owner", () => {

            it("Should be able to enable trading", async () => {
                await onPlanet.setTradingEnabled(0, 60)
                expect(await onPlanet.isTradingEnabled()).to.equals(false);
                await time.increase(time.duration.minutes(1));
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
            
            it("Owner can transfer Tokens without paying tax", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, 1_000_000)
                expect(Number(await onPlanet.balanceOf(ali.address))).to.equals(1_000_000)

            })

            it("Owner can transfer Tokens more than _maxTxAmount", async () => {
                await startTrading();
                await onPlanet.transfer(ali.address, web3.utils.toWei('6000000', 'ether'));
                // console.log()
            })

            it("Token transfer will emit Transfer event", async () => {
                await startTrading();
                expect(await onPlanet.transfer(ali.address, 1_000_000))
                    .to.emit(onPlanet, "Transfer").withArgs(deployer.address, ali.address, 1_000_000)
            })

            it("User will recive tokens as expectation", async () => {
                await startTrading();
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

            it("includeInReward function works as expectation", async () => {
                await onPlanet.excludeFromReward(ali.address)
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(true)
                await onPlanet.includeInReward(ali.address)
                expect(await onPlanet.isExcludedFromReward(ali.address)).to.be.equal(false)
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

            it("setReflectionEnabled function works as expectation", async () => {
                expect(await onPlanet.isReflection()).to.be.equal(true);
                await onPlanet.setReflectionEnabled(false);
                expect(await onPlanet.isReflection()).to.be.equal(false);
                // await onPlanet.setReflectionEnabled(true);
                // expect(await onPlanet.isReflection()).to.be.equal(true);

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
                ).to.changeEtherBalance(onPlanet, `-${ethers.utils.parseEther("10.0")}` )

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

            it("reflectionFromToken with tAmount more than supply should revert", async ()=> {
                const supply = await onPlanet.totalSupply();
                const one = BigNumber.from("1")
                await expect(onPlanet.reflectionFromToken(supply.add(one), false)).to.be.reverted;
            })

                    // it("reflectionFromToken of tokens more or equal to _rTotal should be reverted", async ()=> {
        //     const supply = await onPlanet.totalSupply();
        //     const one = BigNumber.from("1")
        //     await expect(onPlanet.tokenFromReflection(supply.add(one))).to.be.reverted;
        // })






            // it("Console", async () => {

            //     await startTrading();

            //     await onPlanet.transfer(ali.address, web3.utils.toWei('1', 'ether'))
            //     console.log( "ali",  Number(await onPlanet.balanceOf(ali.address)) )
            //     await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('1', 'ether'))
            //     console.log("dave",  Number(await onPlanet.balanceOf(dave.address)) )
            //     await onPlanet.connect(dave).transfer(ali.address, web3.utils.toWei('0.9', 'ether'))
            //     console.log("ali",  Number(await onPlanet.balanceOf(ali.address)) )
            //     await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('0.8', 'ether'))
            //     console.log("ali",  Number(await onPlanet.balanceOf(ali.address)) )

            //     console.log("Deployed is excluded from reward ", await onPlanet.isExcludedFromReward(deployer.address) )
            //     console.log("Ali is excluded from reward ", await onPlanet.isExcludedFromReward(ali.address) )
            //     console.log("Dave is excluded from reward ", await onPlanet.isExcludedFromReward(dave.address) )

            //     console.log("tokenFromReflection from 1 Token", Number(await onPlanet.tokenFromReflection(web3.utils.toWei('1', 'ether'))))
            //     console.log("totalFees ", Number( await onPlanet.totalFees() ))
            //     console.log("buyBackUpperLimitAmount ", Number( web3.utils.fromWei(String( await onPlanet.buyBackUpperLimitAmount()), "ether" ) ))
            //     console.log("reflection From 1 Token without fees ", Number( await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), false) ))
            //     console.log("reflection From 1 Token with fees ", Number( await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), true) ))


            // })

        })

        describe("as buy back owner", () => {

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

            it("setBuybackUpperLimit should revert with buyBackLimit more than 10 ", async () => {
                await expect(onPlanet.setBuybackUpperLimit(11, 0)).to.be.reverted;        
            })

            it("setBuybackTriggerTokenLimit functions work as expectation", async () => {
                // expect(await onPlanet.buyBackTriggerTokenLimit()).to.be.equal(ethers.utils.parseEther("1000000"))
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
                // expect(await onPlanet.buyBackTriggerTokenLimit()).to.be.equal(ethers.utils.parseEther("1000000"))
                await onPlanet.setBuybackMinAvailability(0, 0);
                await expect(onPlanet.setBuybackMinAvailability(2, 0)).to.be.reverted;
                await expect(onPlanet.setBuybackMinAvailability(0, 0)).to.be.reverted;
                // expect(await onPlanet.buyBackTriggerTokenLimit()).to.be.equal(ethers.utils.parseEther("2000000"))
            })


            it("setBuyBackEnabled functions work as expectation", async () => {
                expect(await onPlanet.buyBackEnabled()).to.be.equal(false)
                await onPlanet.setBuyBackEnabled(true);
                expect(await onPlanet.buyBackEnabled()).to.be.equal(true)
            })

            it("setBuyBackEnabled function emits BuyBackEnabledUpdated event", async () => {
                expect(await onPlanet.setBuyBackEnabled(true))
                    .to.emit(onPlanet, "BuyBackEnabledUpdated").withArgs(true)
            })

        })


    })




})

// const latestTime = Number((await time.latest()));
// const OneDayDuration = Number(await time.duration.days(1));
// await time.increase(time.duration.minutes(1));



// console.log("myWETH.address", myWETH.address)
// console.log("factory.address", factory.address)
// console.log("router.address", router.address)

// const wethTest = await router.WETH();
// console.log("wethTest", wethTest)

// const factoryTest = await router.factory();
// console.log("factoryTest", factoryTest)

// console.log("OnPlanet Contract Address:", onPlanet.address);

// const pairAddress = await factory.getPair(myWETH.address, onPlanet.address)
// console.log("pairAddress:", pairAddress);