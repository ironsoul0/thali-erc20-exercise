import hre, { ethers } from "hardhat";

const TOTAL_SUPPLY = 1337;

async function main() {
  const { network } = hre;

  if (network.name === "localhost") {
    const MulticallFactory = await ethers.getContractFactory("Multicall");
    await MulticallFactory.deploy();
  }

  const USDCFactory = await ethers.getContractFactory("USDC");
  const usdcContract = await USDCFactory.deploy(
    ethers.utils.parseEther(TOTAL_SUPPLY.toString())
  );
  console.log("Deployed USDC to", usdcContract.address);

  const StakerFactory = await ethers.getContractFactory("Staker");
  const stakerContract = await StakerFactory.deploy(usdcContract.address);
  console.log("Deployed Staker to", stakerContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
