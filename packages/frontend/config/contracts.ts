import { ChainId } from "@usedapp/core";
import { ChainIDUrl, TARGET_CHAIN } from "config";
import { ethers } from "ethers";

import StakerArtifact from "../artifacts/contracts/Staker.sol/Staker.json";
import USDCArtifact from "../artifacts/contracts/USDC.sol/USDC.json";

const usdcAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F",
  [ChainId.Ropsten]: "0x3862d50C5CD974de510D84407D1a2e1546301bD5",
};

const stakerAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0x09635F643e140090A9A8Dcd712eD6285858ceBef",
  [ChainId.Ropsten]: "0xB394202a75BB251DC3CC45FbD324C44c233FE3F4",
};

export const USDC = {
  abi: USDCArtifact.abi,
  address: usdcAddresses[TARGET_CHAIN],
  interface: new ethers.utils.Interface(USDCArtifact.abi),
};

export const Staker = {
  abi: StakerArtifact.abi,
  address: stakerAddresses[TARGET_CHAIN],
};

export const Multicall = {
  [ChainId.Hardhat]: "0xb7f8bc63bbcad18155201308c8f3540b07f84f5e",
};
