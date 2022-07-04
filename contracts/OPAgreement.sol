// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract OPAgreement {

    IERC20 public OPToken;

    mapping (address => bool) public isInAgreement;
    mapping (address => uint) public stakedTokens;
    uint public totalStakedTokens;

    constructor(IERC20 _OPToken) {
        OPToken = _OPToken;
    }

    modifier onlyOP {
        require(msg.sender == address(OPToken), "only OP contract can call this function");
        _;
    }

    function makeAgreement(uint tokensToStake) public {
        uint userBalance = OPToken.balanceOf(msg.sender);
        require(userBalance >= tokensToStake, "Not enough tokens to stake");
        require(isInAgreement[msg.sender] == false, "Already staked");
        isInAgreement[msg.sender] = true;
        stakedTokens[msg.sender] = tokensToStake;
        totalStakedTokens += tokensToStake;
    }

    function validateAgreement(address _user, uint remainingBalance) public onlyOP {
        if(remainingBalance < stakedTokens[_user]){
            breakAgreement(_user);
        }

    }

    function breakAgreement(address _user) internal {
        uint tokensStakedPreviously = stakedTokens[_user];
        isInAgreement[_user] = false;
        stakedTokens[_user] = 0;
        totalStakedTokens -= tokensStakedPreviously;
    }


}