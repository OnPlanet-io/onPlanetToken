const { ethers, upgrades } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const OP = await ethers.getContractFactory("onPlanet");
  onPlanet = await OP.deploy("0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3", "0x80364e820150C531DDC8c5FdAca94EA9C8097D1E", "0xC2a5ea1d4406EC5fdd5eDFE0E13F59124C7e9803", "0xC2a5ea1d4406EC5fdd5eDFE0E13F59124C7e9803");
  console.log("OnPlanet Contract Address:", onPlanet.address);
  // const UniswapV2Factory: UniswapV2Factory__factory = await ethers.getContractFactory("UniswapV2Factory");
  // const UniswapV2Router02: UniswapV2Router02__factory = await ethers.getContractFactory('UniswapV2Router02');
  // const UniswapV2Pair: IUniswapV2Pair__factory = await ethers.getContractFactory('UniswapV2Pair');
  // const WETH: WETH9__factory = await ethers.getContractFactory('WETH9');
  // const USDT: BEP20__factory = await ethers.getContractFactory('BEP20');
  // const OP: OnPlanet__factory = await ethers.getContractFactory("onPlanet");


  // myWETH = await WETH.deploy();
  // myUSDT = await USDT.deploy();
  // factory = await UniswapV2Factory.deploy(deployer.address);
  // router = await UniswapV2Router02.deploy(factory.address, myWETH.address, overrides);
  // onPlanet = await OP.deploy(router.address, myUSDT.address);
  // uniswapV2PairAddress = await factory.getPair(myWETH.address, onPlanet.address)
  // uniswapV2Pair = await UniswapV2Pair.attach(uniswapV2PairAddress)

  // console.log("OnPlanet Contract Address:", onPlanet.address);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
