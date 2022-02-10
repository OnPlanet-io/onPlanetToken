/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { SafeMath, SafeMathInterface } from "../SafeMath";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "c__0x477c234d",
        type: "bytes32",
      },
    ],
    name: "c_0x477c234d",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x60a3610052600b82828239805160001a607314610045577f4e487b7100000000000000000000000000000000000000000000000000000000600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361060335760003560e01c806314adcbff146038575b600080fd5b604e6004803603810190604a91906053565b6050565b005b50565b6000602082840312156063578081fd5b813590509291505056fea2646970667358221220c64e1b3f16b71fe54db0944aa5c247431a8bd1647b702681415f5f707e6e788864736f6c63430008040033";

type SafeMathConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SafeMathConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SafeMath__factory extends ContractFactory {
  constructor(...args: SafeMathConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "SafeMath";
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SafeMath> {
    return super.deploy(overrides || {}) as Promise<SafeMath>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): SafeMath {
    return super.attach(address) as SafeMath;
  }
  connect(signer: Signer): SafeMath__factory {
    return super.connect(signer) as SafeMath__factory;
  }
  static readonly contractName: "SafeMath";
  public readonly contractName: "SafeMath";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SafeMathInterface {
    return new utils.Interface(_abi) as SafeMathInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SafeMath {
    return new Contract(address, _abi, signerOrProvider) as SafeMath;
  }
}
