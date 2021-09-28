import { utils } from "ethers";
import { ethers } from "hardhat";

import { Staker } from "../types/typechain/Staker";
import { USDC } from "../types/typechain/USDC";
import { expect } from "./chai-setup";

const TOTAL_SUPPLY = 1337;

describe("USDC interaction", () => {
  let usdc: USDC;
  let deployer: string;

  before(async () => {
    const USDCFactory = await ethers.getContractFactory("USDC");
    usdc = (await USDCFactory.deploy(
      utils.parseEther(TOTAL_SUPPLY.toString())
    )) as USDC;

    const accounts = await ethers.getSigners();
    deployer = accounts[0].address;
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
      const randomSigner = (await ethers.getSigners())[2];
      expect(staker.connect(randomSigner).depositTokens(utils.parseEther("1")))
        .to.be.reverted;
    });

    it("Account deposits non-zero amount and 0.2% goes to treasury", async () => {
      const randomSigner = (await ethers.getSigners())[3];
      const tokenAmount = utils.parseEther("10");

      await usdc.connect(randomSigner).freeMint(tokenAmount);
      await usdc
        .connect(randomSigner)
        .increaseAllowance(staker.address, tokenAmount);

      await staker.connect(randomSigner).depositTokens(tokenAmount);

      const fee = tokenAmount.mul(2).div(1000);
      const treasuryAmount = await staker.treasuryAmount();
      expect(treasuryAmount).to.be.equal(fee);

      const personDeposit = await staker.depositedAmount(randomSigner.address);
      expect(personDeposit).to.be.equal(tokenAmount.sub(fee));
    });

    it("Person can try to withdraw only afer 2 hours", async () => {
      const randomSigner = (await ethers.getSigners())[4];
      const tokenAmount = utils.parseEther("10");

      await usdc.connect(randomSigner).freeMint(tokenAmount);
      await usdc
        .connect(randomSigner)
        .increaseAllowance(staker.address, tokenAmount);
      await staker.connect(randomSigner).depositTokens(tokenAmount);

      await expect(staker.connect(randomSigner).withdrawTokens(tokenAmount)).to
        .be.reverted;

      const withdrawAmount = utils.parseEther("1");
      await expect(
        staker.connect(randomSigner).withdrawTokens(withdrawAmount)
      ).to.be.revertedWith("Allowed to withdraw only after 2 hours");

      await ethers.provider.send("evm_increaseTime", [1 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        staker.connect(randomSigner).withdrawTokens(withdrawAmount)
      ).to.be.revertedWith("Allowed to withdraw only after 2 hours");

      await ethers.provider.send("evm_increaseTime", [1 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);

      await expect(staker.connect(randomSigner).withdrawTokens(withdrawAmount))
        .to.not.be.reverted;

      const newTokenBalance = await usdc.balanceOf(randomSigner.address);
      expect(newTokenBalance).to.be.equal(withdrawAmount);

      const depositLeft = await staker.depositedAmount(randomSigner.address);
      expect(depositLeft).to.be.equal(
        tokenAmount.mul(998).div(1000).sub(withdrawAmount)
      );
    });
  });
});
