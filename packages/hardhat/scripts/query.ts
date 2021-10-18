import { ethers } from "hardhat";
import { USDC } from "types/typechain";

import USDC_ABI from "../artifacts/contracts/USDC.sol/USDC.json";

async function main() {
  const { USDC_ADDRESS } = process.env;
  const accounts = await ethers.getSigners();

  console.log("account", accounts[0].address);

  if (!accounts.length) {
    throw new Error("No accounts were found");
  }

  if (!USDC_ADDRESS) {
    throw new Error("No contract address was found");
  }
  const signer = accounts[0];

  const contract = new ethers.Contract(
    USDC_ADDRESS,
    USDC_ABI.abi,
    signer
  ) as USDC;

  const isPaused = await contract.paused();
  console.log("isPaused", isPaused);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
