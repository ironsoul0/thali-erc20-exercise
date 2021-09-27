import { utils } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";

import { Staker } from "../types/typechain/Staker";
import { USDC } from "../types/typechain/USDC";
import { expect } from "./chai-setup";

const TOTAL_SUPPLY = 1337;

describe("USDC Contract", () => {
  let usdc: USDC;
  let deployer: string;

  before(async () => {
    const USDCFactory = await ethers.getContractFactory("USDC");
    usdc = (await USDCFactory.deploy(
      utils.parseEther(TOTAL_SUPPLY.toString())
    )) as USDC;

    const accounts = await getNamedAccounts();
    deployer = accounts.deployer;
  });

  it("Deployment should mint supply to the owner", async () => {
    const totalSupply = await usdc.totalSupply();
    const ownerBalance = await usdc.balanceOf(deployer);

    expect(totalSupply).to.be.equal(ownerBalance);
    expect(totalSupply).to.be.equal(utils.parseEther(TOTAL_SUPPLY.toString()));
  });

  it("Owner of contract is deployer", async () => {
    const owner = await usdc.owner();
    expect(owner).to.be.equal(deployer);
  });

  it("Account cam freely mint new tokens", async () => {
    const randomSigner = (await ethers.getSigners())[1];
    const tokensToMint = "100";

    await usdc.connect(randomSigner).freeMint(utils.parseEther(tokensToMint));
    const accountBalance = await usdc.balanceOf(randomSigner.address);

    expect(accountBalance).to.be.equal(utils.parseEther(tokensToMint));
  });

  describe("Staking logic", async () => {
    let staker: Staker;

    before(async () => {
      const USDCFactory = await ethers.getContractFactory("USDC");
      usdc = (await USDCFactory.deploy(
        utils.parseEther(TOTAL_SUPPLY.toString())
      )) as USDC;

      const StakerFactory = await ethers.getContractFactory("Staker");
      staker = (await StakerFactory.deploy(usdc.address)) as Staker;
    });

    it("Account with zero balance tries to deposit", async () => {
      const randomSigner = (await ethers.getSigners())[1];
      await expect(
        staker.connect(randomSigner).depositTokens(utils.parseEther("1"))
      ).to.be.reverted;
    });

    it("Account deposits non-zero amount", async () => {
      const randomSigner = (await ethers.getSigners())[1];

      await usdc.connect(randomSigner).freeMint(utils.parseEther("10"));
      await usdc
        .connect(randomSigner)
        .increaseAllowance(staker.address, utils.parseEther("1"));

      await expect(
        staker.connect(randomSigner).depositTokens(utils.parseEther("1"))
      ).to.be.reverted;
    });
  });
});
