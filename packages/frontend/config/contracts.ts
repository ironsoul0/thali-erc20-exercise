import { ChainId } from "@usedapp/core";
import { ChainIDUrl, TARGET_CHAIN } from "config";

import StakerArtifact from "../artifacts/contracts/Staker.sol/Staker.json";
import USDCArtifact from "../artifacts/contracts/USDC.sol/USDC.json";

const usdcAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  [ChainId.Ropsten]: "0xD8Ed07a7ad69f8E9D06A3b59847c0Fc9525F11E8",
};

const stakerAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  [ChainId.Ropsten]: "0x0CECa23490E9a9E60dC52d3A0D98FCA007C86113",
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