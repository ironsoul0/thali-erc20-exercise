import { utils } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const TOTAL_SUPPLY = 1337;

const main: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { network, deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (network.name === "localhost") {
    await deploy("Multicall", {
      from: deployer,
      args: [],
      log: true,
    });
  }

  const tokenContract = await deploy("USDC", {
    from: deployer,
    args: [utils.parseEther(TOTAL_SUPPLY.toString())],
    log: true,
  });

  await deploy("Staker", {
    from: deployer,
    args: [tokenContract.address],
    log: true,
  });
};

export default main;

main.tags = ["Multicall", "USDC", "Staker"];
