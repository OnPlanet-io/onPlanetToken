/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { WETH9, WETH9Interface } from "../WETH9";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "guy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "guy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040526040518060400160405280600d81526020017f57726170706564204574686572000000000000000000000000000000000000008152506000908051906020019062000051929190620000d0565b506040518060400160405280600481526020017f5745544800000000000000000000000000000000000000000000000000000000815250600190805190602001906200009f929190620000d0565b506012600260006101000a81548160ff021916908360ff160217905550348015620000c957600080fd5b506200017f565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200011357805160ff191683800117855562000144565b8280016001018555821562000144579182015b828111156200014357825182559160200191906001019062000126565b5b50905062000153919062000157565b5090565b6200017c91905b80821115620001785760008160009055506001016200015e565b5090565b90565b611670806200018f6000396000f3fe60806040526004361061009c5760003560e01c8063313ce56711610064578063313ce5671461029d57806370a08231146102ce57806395d89b4114610333578063a9059cbb146103c3578063d0e30db014610436578063dd62ed3e146104405761009c565b806306fdde03146100a1578063095ea7b31461013157806318160ddd146101a457806323b872dd146101cf5780632e1a7d4d14610262575b600080fd5b3480156100ad57600080fd5b506100b66104c5565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100f65780820151818401526020810190506100db565b50505050905090810190601f1680156101235780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561013d57600080fd5b5061018a6004803603604081101561015457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610563565b604051808215151515815260200191505060405180910390f35b3480156101b057600080fd5b506101b9610789565b6040518082815260200191505060405180910390f35b3480156101db57600080fd5b50610248600480360360608110156101f257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610815565b604051808215151515815260200191505060405180910390f35b34801561026e57600080fd5b5061029b6004803603602081101561028557600080fd5b8101908080359060200190929190505050610fde565b005b3480156102a957600080fd5b506102b2611337565b604051808260ff1660ff16815260200191505060405180910390f35b3480156102da57600080fd5b5061031d600480360360208110156102f157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061134a565b6040518082815260200191505060405180910390f35b34801561033f57600080fd5b50610348611362565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561038857808201518184015260208101905061036d565b50505050905090810190601f1680156103b55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156103cf57600080fd5b5061041c600480360360408110156103e657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050611400565b604051808215151515815260200191505060405180910390f35b61043e611499565b005b34801561044c57600080fd5b506104af6004803603604081101561046357600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611612565b6040518082815260200191505060405180910390f35b60008054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561055b5780601f106105305761010080835404028352916020019161055b565b820191906000526020600020905b81548152906001019060200180831161053e57829003601f168201915b505050505081565b60006105917fa81f859b3b556425e3f51516020ce52bb1bb5d3712a053c0ca424514d1fbcbca60001b611637565b6105bd7fcc8b22c5373b7753c5ac5e663a1f1c9faba596f783a74b6f26ef45c4c14e1e0f60001b611637565b6105e97f36e749e879a1295ffa411a31ea85651249d56a4808e31b8811999d9e993f472c60001b611637565b81600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055506106967f0eb4a6656ed532753257f2bfebf8d77e3cadf5717b4190c82ebacc3332e5ae9760001b611637565b6106c27fd5475eec070c517478461b4ae02d5013ac1a0b7a0143c0ac3fb33e1d1dc1079760001b611637565b8273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36107537f8c14557a65235d7eb02b272233e88793fd31739fb766f5eb52faaeffb8ce2c0a60001b611637565b61077f7f4421d6d878f539ffd361be521ec23beb9403dac6166086463eb680a676808da960001b611637565b6001905092915050565b60006107b77fc5fb14f91f3d84870037066d1566a89e451f8b5aa051352f3b8ba35930c8fe1a60001b611637565b6107e37f22c0fbe41ae3c8eb3dbb9c2a31699a1aae775647fb903a697caf0ae1fe1ab7eb60001b611637565b61080f7f5beaf766bfdd1abc7281189fbc4b75106eb10e9eae48c6d63caee98b9d695b7460001b611637565b47905090565b60006108437fc52b76037f32b68c7f556702ceb1b6a44fa0a5bd1f249e129d0bc2380226ce5760001b611637565b61086f7f3b541f4dc5f10059d64a16c997d7d0f93f3ddc54fdbcc7ad649149a7e4a1d11660001b611637565b61089b7f0f417aa6fcb41666a346bae4280293a3f8a5f8c9985e892a52ce01259046757960001b611637565b6108c77f143acd9360f17bfcc68d6099ac0aaee1e537eaeb6a5b530523328587191a85c260001b611637565b81600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610957576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526000815260200160200191505060405180910390fd5b6109837f67984424e44ce360179e8da891550a7211a55583de5ae6c8029f55643a85551f60001b611637565b6109af7fff3aaaa0eb6030de587ff84b53b1ccffddddc4028659142a22898f69ec515f6460001b611637565b6109db7fef9a17ac17cef9537113077634a0a27bb8b3c780dbf1fc21bac5bf28c3dcdee560001b611637565b3373ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614158015610ab357507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205414155b15610d4857610ae47f655aba1c7e5a93c6217dedd6e36834428d50e51f1e5e6b2315355caf087b796a60001b611637565b610b107f48bb2e5a6835f2f459efc4a6a887d4295ecd2c6f102d7ef2d6fc3fd0c303bba360001b611637565b610b3c7f7a1dec5e22d586ff36f7cc1618d9a624ae07a6905cc91e0decd3e6044a2fa6fb60001b611637565b610b687ff5133644b5619f1e3feeefe6786d2224bcd45c38198adc13a774fb1cae90e1e260001b611637565b81600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015610c35576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526000815260200160200191505060405180910390fd5b610c617f2fa0ae2b5fa51de1138b60c3a47fd34e7080c17f75efdbd69b41eb9225c1ef7060001b611637565b610c8d7f53ce14cc71b3bf4f1bc2ce771ae0338c4f65d2d59fe5873195d4609f76dfdd6860001b611637565b610cb97fe6d066e263e640be8144b370722c2c7c918cd9f119909a2ce7897d30d4b40b4060001b611637565b81600460008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540392505081905550610d75565b610d747f339717bf4bd5f2eb036e9fa1954ea5b286c5c5c87c182a1c15c268d03b334adf60001b611637565b5b610da17f5aabf02e6bc77b6d4a99a1645a21e1785a276c29b63f3e5c1c29096ae2f3bacd60001b611637565b610dcd7fc7c70b0facf2e6f07ab89930f8f0a462b025aa434630f9f5bf5fa6c97221599360001b611637565b81600360008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540392505081905550610e467ffbc1c88d57f039c3a489f25b18603564df7ad534a3d8e88cc07c68a6c8e8d2c160001b611637565b610e717e7b5617fbcc9cb88441705bd21d9e7b8cd795c220088491537d957a70dc73f560001b611637565b81600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540192505081905550610eea7f84e6cc8cd06eaf1b4cbdada8c5254d548e3e5d033bfef328c775a8fa4f23c72760001b611637565b610f167f90681f8a67db12930f55c59b38e678e63229ce4f79bb5546fee5030eb8732a9d60001b611637565b8273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a3610fa77fdc97af334ce68f7d64de9cea58e7556bd729ebbe92801b843ebc8ccff151ff5c60001b611637565b610fd37f0b2ba41b4edca8410f67608aaaf558d5b7cab34a676e5e67eac4e725a330858260001b611637565b600190509392505050565b61100a7f6f98995fea33a1fcab79ab1daa813762baa9b9153bb5d288fc2deed009895ca760001b611637565b6110367fe4aad09afc7f7125b058bf2069ea95e4c8edbdb374cddeaf39df5363f945848b60001b611637565b6110627fc171570d720c487386eaa11cbf974e7d5549da21782718a094fc92b994dcf8ff60001b611637565b61108e7f412a178c4e6c36b0758c0565140278bc38875e01564d63159a6cc3403dcce33e60001b611637565b80600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101561111e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526000815260200160200191505060405180910390fd5b61114a7ff7a6fa7dd7906c7aafd6dc49c37c699e8d6ef4b02fc34eb8bc2e941827503ec260001b611637565b6111767f94e8b7cc99c67a5edbe881abf2e7b3809a1ec12180d6cf79c41ab9b4cc16b6ec60001b611637565b6111a27f90625d25be98dfda0d1a6ce0ebf97910ed3b1d54e31db9f96d1ca461f72ea99f60001b611637565b80600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555061121b7f82ea4be6b0e294070b8b95688f0c34d53cbafbf32eafa6c788b7c94bfc35d22160001b611637565b6112477f250728ec8b5174cf61d7bc61162cc6dc57fd53ea91031c0d531c716b3b2b241e60001b611637565b3373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f1935050505015801561128d573d6000803e3d6000fd5b506112ba7f3c43135a164823d3e57748dcf83cdc37b0fcac871068f830cd219e50a402b62460001b611637565b6112e67f55f5cf2a1fd63d305ba93ef4bee1ea0e6ed71903ee46ed9e7ce46777e068a5ea60001b611637565b3373ffffffffffffffffffffffffffffffffffffffff167f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65826040518082815260200191505060405180910390a250565b600260009054906101000a900460ff1681565b60036020528060005260406000206000915090505481565b60018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156113f85780601f106113cd576101008083540402835291602001916113f8565b820191906000526020600020905b8154815290600101906020018083116113db57829003601f168201915b505050505081565b600061142e7fedcd02dc58128f5560d88897f791c3df128178430249bc6bb7dcfd9f31f14b4060001b611637565b61145a7fce24bba6689232854ce79aa30377bdc7285678cf23ef2734223cc4641c0bab9c60001b611637565b6114867f1b249b0fd5fb644a8d1baed095ffa4aedcb425c9769b9921287ddc2a7e9538c560001b611637565b611491338484610815565b905092915050565b6114c57f457da06358e3c4d707a955179fed8c8798045ce4ae7f483d5e3f7e9fde38eaa660001b611637565b6114f17fdbdc3710b231c96caf13d47e6a27bdb353a12f0693851c79759f34017349028a60001b611637565b61151d7f29531cb53cdf7ef6cff4b6b62b4b10895810347955ffcaf96b5935a55dc2ed6b60001b611637565b34600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055506115967f5430897ac77a18b313074672885a059e5c685b11f9fa2c3240f643cfcc557fa760001b611637565b6115c27fb3c240eb6255ed32913be7bca4d500ad6384844688770b05d0decfec8ba9c33860001b611637565b3373ffffffffffffffffffffffffffffffffffffffff167fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c346040518082815260200191505060405180910390a2565b6004602052816000526040600020602052806000526040600020600091509150505481565b5056fea26469706673582212202930361f8cbf7f8ec9d31156b1fc92bfd2757ef63aec730de4d7ad82dc44696464736f6c63430006060033";

type WETH9ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WETH9ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WETH9__factory extends ContractFactory {
  constructor(...args: WETH9ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "WETH9";
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<WETH9> {
    return super.deploy(overrides || {}) as Promise<WETH9>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): WETH9 {
    return super.attach(address) as WETH9;
  }
  connect(signer: Signer): WETH9__factory {
    return super.connect(signer) as WETH9__factory;
  }
  static readonly contractName: "WETH9";
  public readonly contractName: "WETH9";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WETH9Interface {
    return new utils.Interface(_abi) as WETH9Interface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): WETH9 {
    return new Contract(address, _abi, signerOrProvider) as WETH9;
  }
}
