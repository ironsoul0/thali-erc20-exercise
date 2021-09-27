import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "solidity-coverage";
import "@nomiclabs/hardhat-waffle";

import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  solidity: "0.8.3",
  namedAccounts: {
    deployer: 0,
  },
  typechain: {
    outDir: "./types/typechain",
    target: "ethers-v5",
  },
};

export default config;
