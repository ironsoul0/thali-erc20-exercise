import { ChainId } from "@usedapp/core";
import { ChainIDUrl, TARGET_CHAIN } from "config";
import { ethers } from "ethers";

import StakerArtifact from "../artifacts/contracts/Staker.sol/Staker.json";
import USDCArtifact from "../artifacts/contracts/USDC.sol/USDC.json";

const usdcAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
  [ChainId.Ropsten]: "0xb471D9f0bd7DB1BB4a20e9e696D29F5dB86a0e03",
};

const stakerAddresses: ChainIDUrl = {
  [ChainId.Hardhat]: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
  [ChainId.Ropsten]: "0xAf6c0f733c31B5da92F302D17A91c7b43c8cb308",
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
