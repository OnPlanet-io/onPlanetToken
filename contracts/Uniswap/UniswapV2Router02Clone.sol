pragma solidity =0.6.6;

import "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";
// import "./RouterMock/UniswapV2Router02.sol";

contract UniswapV2Router02Clone is UniswapV2Router02 {
    using SafeMath for uint;
    
    constructor(address _factory, address _WETH)
    UniswapV2Router02(_factory, _WETH) public {}


}


