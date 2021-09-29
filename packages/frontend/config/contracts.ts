import { ChainId } from "@usedapp/core";
import { ChainIDUrl, TARGET_CHAIN } from "config";

import StakerArtifact from "../artifacts/contracts/Staker.sol/Staker.json";
import USDCArtifact from "../artifacts/contracts/USDC.sol/USDC.json";

const usdcAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  [ChainId.Ropsten]: "0xb471D9f0bd7DB1BB4a20e9e696D29F5dB86a0e03",
};

const stakerAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  [ChainId.Ropsten]: "0xAf6c0f733c31B5da92F302D17A91c7b43c8cb308",
};

export const USDC = {
  abi: USDCArtifact.abi,
  address: usdcAddresses[TARGET_CHAIN],
};

export const Staker = {
  abi: StakerArtifact.abi,
  address: stakerAddresses[TARGET_CHAIN],
};

export const Multicall = {
  [ChainId.Hardhat]: "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0",
};
