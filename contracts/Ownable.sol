// SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.4;

import "./Context.sol";

contract Ownable is Context {
    address private _owner;
    address private _buybackOwner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    modifier onlyBuybackOwner() {
        require(
            _buybackOwner == _msgSender(),
            "Ownable: caller is not the buyback owner"
        );
        _;
    }

    constructor() {
        address msgSender = _msgSender();
        _owner = msgSender;
        _buybackOwner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    function transferOwnership(address newOwner) external virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );

        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function transferBuybackOwnership(address newOwner)
        external
        virtual
        onlyOwner
    {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );

        emit OwnershipTransferred(_buybackOwner, newOwner);
        _buybackOwner = newOwner;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function buybackOwner() public view returns (address) {
        return _buybackOwner;
    }
}