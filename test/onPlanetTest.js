const { assert, expect, use } = require('chai');
const { balance, time } = require('@openzeppelin/test-helpers');

const { ethers } = require('hardhat');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
// const { web3 } = require('@openzeppelin/test-helpers/src/setup');
// const {
//     ether,
//     expectRevert,
//     expectEvent,
//     time
// } = require('@openzeppelin/test-helpers')
// const { MaxUint256 } = require('ethers/constants')


const overrides = {
    gasLimit: 9999999
}

let deployer, ali, dave
let onPlanet, myWETH, factory, router

describe('onPlanet Test Stack', () => {

    const startTrading = async () => {
        await onPlanet.setTradingEnabled(0, 60)
        await time.increase(time.duration.minutes(1));
    }

    beforeEach(async () => {

        [deployer, ali, dave] = await ethers.getSigners()

        const UniswapV2Factory = await ethers.getContractFactory("UniswapV2FactoryClone")
        const UniswapV2Router02 = await ethers.getContractFactory('UniswapV2Router02Clone')
        const WETH = await ethers.getContractFactory('WETH9')
        const OP = await ethers.getContractFactory("onPlanet");

        myWETH = await WETH.deploy()
        factory = await UniswapV2Factory.deploy(deployer.address)
        router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides)
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
            expect(Number(await onPlanet.maxTxCooldownAmount())).to.equals(10**9 * 10**18 / 2000);
        })

    })
        
    describe("Before trading is enable", () => {
        
        it('User cannot transfer tokens', async () => {
            await expect(onPlanet.transfer(ali.address, 1000)).to.be.revertedWith(
                "VM Exception while processing transaction: reverted with reason string 'Trading has not started"
            )
        });
    //     //   it('Transfer emits event', async () => {
    //     //     await expect(token.transfer(walletTo.address, 7))
    //     //       .to.emit(token, 'Transfer')
    //     //       .withArgs(wallet.address, walletTo.address, 7);
    //     //   });

    //     //   it('Can not transfer above the amount', async () => {
    //     //     await expect(token.transfer(walletTo.address, 1007)).to.be.reverted;
    //     //   });

    //     //   it('Can not transfer from empty account', async () => {
    //     //     const tokenFromOtherWallet = token.connect(walletTo);
    //     //     await expect(tokenFromOtherWallet.transfer(wallet.address, 1))
    //     //       .to.be.reverted;
    //     //   });

    //     //   it('Calls totalSupply on BasicToken contract', async () => {
    //     //     await token.totalSupply();
    //     //     expect('totalSupply').to.be.calledOnContract(token);
    //     //   });

    //     //   it('Calls balanceOf with sender address on BasicToken contract', async () => {
    //     //     await token.balanceOf(wallet.address);
    //     //     expect('balanceOf').to.be.calledOnContractWith(token, [wallet.address]);
    //     //   });

    })

    describe("After trading is enables", () => {

    describe("as owner", () => {
        
        it("Only owner can enable trading", async ()=> {
            await onPlanet.setTradingEnabled(0, 60)
            expect(await onPlanet.isTradingEnabled()).to.equals(false);
            await time.increase(time.duration.minutes(1));
            expect(await onPlanet.isTradingEnabled()).to.equals(true);
        })
        
        it("Enable trading emits event", async () => {
            await expect(await onPlanet.setTradingEnabled(0, 60))
            .to.emit(onPlanet, "TradingEnabled")
        })

        it("Owner can transfer Tokens without paying tax", async () => {
            await startTrading();
            await onPlanet.transfer(ali.address, 1_000_000)
            expect(Number(await onPlanet.balanceOf(ali.address))).to.equals(1_000_000)

        })

        it("Owner can transfer Tokens more than _maxTxAmount", async () => {
            await startTrading();
            await onPlanet.transfer( ali.address, web3.utils.toWei('6000000', 'ether'));
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
            expect( await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether')) )
            .to.emit(onPlanet, "Approval")
            .withArgs(deployer.address, ali.address, web3.utils.toWei('1', 'ether'))
        })

        it("Allownce function working as expectation", async () => {
            await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))
            expect(await onPlanet.allowance(deployer.address, ali.address)).to.equals(web3.utils.toWei('1', 'ether'))
                    
        })

       
        it("IncreaseAllowance function works as expectation and emits Approval event", async () => {
            await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))
            
            expect( await onPlanet.increaseAllowance(ali.address, web3.utils.toWei('1', 'ether')) )
            .to.emit(onPlanet, "Approval")
            .withArgs(deployer.address, ali.address, web3.utils.toWei('2', 'ether'))
            
            expect(await onPlanet.allowance(deployer.address, ali.address)).to.equals(web3.utils.toWei('2', 'ether'))

        })


        it("IncreaseAllowance function works as expectation and emits Approval event", async () => {
            await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))
            
            expect( await onPlanet.decreaseAllowance(ali.address, web3.utils.toWei('1', 'ether')) )
            .to.emit(onPlanet, "Approval")
            .withArgs(deployer.address, ali.address, web3.utils.toWei('0', 'ether'))
            
            expect(await onPlanet.allowance(deployer.address, ali.address)).to.equals(web3.utils.toWei('0', 'ether'))

        })
        
        it("TransferFrom function works as expectation and emit Transfer and Approval events", async () => {
            await startTrading();
            await onPlanet.approve(ali.address, web3.utils.toWei('1', 'ether'))
            expect( await onPlanet.connect(ali).transferFrom(deployer.address, dave.address, web3.utils.toWei('1', 'ether')) )
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


        it("Console", async () => {

            // await startTrading();

            // await onPlanet.transfer(ali.address, web3.utils.toWei('1', 'ether'))
            // console.log( "ali",  Number(await onPlanet.balanceOf(ali.address)) )
            // await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('1', 'ether'))
            // console.log("dave",  Number(await onPlanet.balanceOf(dave.address)) )
            // await onPlanet.connect(dave).transfer(ali.address, web3.utils.toWei('0.9', 'ether'))
            // console.log("ali",  Number(await onPlanet.balanceOf(ali.address)) )
            // await onPlanet.connect(ali).transfer(dave.address, web3.utils.toWei('0.8', 'ether'))
            // console.log("ali",  Number(await onPlanet.balanceOf(ali.address)) )
            
            // console.log("Deployed is excluded from reward ", await onPlanet.isExcludedFromReward(deployer.address) )
            // console.log("Ali is excluded from reward ", await onPlanet.isExcludedFromReward(ali.address) )
            // console.log("Dave is excluded from reward ", await onPlanet.isExcludedFromReward(dave.address) )
            
            // console.log("tokenFromReflection from 1 Token", Number(await onPlanet.tokenFromReflection(web3.utils.toWei('1', 'ether'))))
            // console.log("totalFees ", Number( await onPlanet.totalFees() ))
            // console.log("buyBackUpperLimitAmount ", Number( web3.utils.fromWei(String( await onPlanet.buyBackUpperLimitAmount()), "ether" ) ))
            // console.log("reflection From 1 Token without fees ", Number( await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), false) ))
            // console.log("reflection From 1 Token fees ", Number( await onPlanet.reflectionFromToken(web3.utils.toWei('1', 'ether'), true) ))

            
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