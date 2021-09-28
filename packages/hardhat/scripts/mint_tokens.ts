import { ethers } from "hardhat";
import { USDC } from "types/typechain";

import USDC_ABI from "../artifacts/contracts/USDC.sol/USDC.json";

async function main() {
  const { USDC_ADDRESS } = process.env;
  const accounts = await ethers.getSigners();

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

  const tx = await contract.freeMint(ethers.utils.parseEther("100"));
  await tx.wait();
  const balance = await contract.balanceOf(signer.address);

  console.log(
    `New balance of the address is ${ethers.utils.formatEther(balance)}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
