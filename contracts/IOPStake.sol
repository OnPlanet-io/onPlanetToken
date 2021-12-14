// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

interface IOPStake {
    function createRewards(address acount, uint256 tAmount) external;

    function deliver(uint256 tAmount) external;
}