import { utils } from "ethers";
import { ethers } from "hardhat";

import { Staker } from "../types/typechain/Staker";
import { USDC } from "../types/typechain/USDC";
import { expect } from "./chai-setup";

const TOTAL_SUPPLY = 1337;

describe("USDC interaction", () => {
  let usdc: USDC;
  let deployer: string;
  let adminRole: string;
  let minterRole: string;
  let pauserRole: string;

  before(async () => {
    const USDCFactory = await ethers.getContractFactory("USDC");
    const accounts = await ethers.getSigners();

    deployer = accounts[0].address;
    usdc = (await USDCFactory.deploy(
      utils.parseEther(TOTAL_SUPPLY.toString()),
      deployer
    )) as USDC;

    adminRole = await usdc.DEFAULT_ADMIN_ROLE();
    minterRole = await usdc.MINTER_ROLE();
    pauserRole = await usdc.PAUSER_ROLE();
  });

  it("Deployment should mint supply to the owner", async () => {
    const totalSupply = await usdc.totalSupply();
    const ownerBalance = await usdc.balanceOf(deployer);

    expect(totalSupply).to.be.equal(ownerBalance);
    expect(totalSupply).to.be.equal(utils.parseEther(TOTAL_SUPPLY.toString()));
  });

  it("Default admin of contract is deployer", async () => {
    const owner = await usdc.hasRole(adminRole, deployer);
    expect(owner).to.be.true;
  });

  it("Account with minter role can freely mint new tokens", async () => {
    const randomSigner = (await ethers.getSigners())[1];
    const tokensToMint = "100";

    await usdc.grantRole(minterRole, randomSigner.address);
    await usdc.connect(randomSigner).freeMint(utils.parseEther(tokensToMint));
    const accountBalance = await usdc.balanceOf(randomSigner.address);

    expect(accountBalance).to.be.equal(utils.parseEther(tokensToMint));
  });

  it("Account with pauser role can pause and unpause", async () => {
    const minter = (await ethers.getSigners())[4];
    const pauser = (await ethers.getSigners())[2];
    const tokensToMint = "100";

    await usdc.grantRole(minterRole, minter.address);
    await usdc.grantRole(pauserRole, pauser.address);
    await usdc.connect(pauser).pause();
    await expect(usdc.connect(minter).freeMint(utils.parseEther(tokensToMint)))
      .to.be.reverted;
    await usdc.connect(pauser).unpause();
    await usdc.connect(minter).freeMint(utils.parseEther(tokensToMint));
    const accountBalance = await usdc.balanceOf(minter.address);
    expect(accountBalance).to.be.equal(utils.parseEther(tokensToMint));
  });

  describe("Staking logic", async () => {
    let staker: Staker;
    let minterRole: string;

    before(async () => {
      const USDCFactory = await ethers.getContractFactory("USDC");
      usdc = (await USDCFactory.deploy(
        utils.parseEther(TOTAL_SUPPLY.toString()),
        deployer
      )) as USDC;

      const StakerFactory = await ethers.getContractFactory("Staker");
      staker = (await StakerFactory.deploy(usdc.address)) as Staker;

      minterRole = await usdc.MINTER_ROLE();
    });

    it("Account with zero balance tries to deposit", async () => {
      const randomSigner = (await ethers.getSigners())[2];
      expect(staker.connect(randomSigner).depositTokens(utils.parseEther("1")))
        .to.be.reverted;
    });

    it("Account deposits non-zero amount and 0.2% goes to treasury", async () => {
      const randomSigner = (await ethers.getSigners())[3];
      const tokenAmount = utils.parseEther("10");

      await usdc.grantRole(minterRole, randomSigner.address);
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

      await usdc.grantRole(minterRole, randomSigner.address);
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

  describe("Roles logic", async () => {
    let usdc: USDC;

    before(async () => {
      const USDCFactory = await ethers.getContractFactory("USDC");
      usdc = (await USDCFactory.deploy(
        utils.parseEther(TOTAL_SUPPLY.toString()),
        deployer
      )) as USDC;

      minterRole = await usdc.MINTER_ROLE();
    });

    it("Deployer has an admin role", async () => {
      const roles = await usdc.getRoles();
      expect(roles.length).to.be.equal(1);
      expect(roles[0]).to.be.equal(ethers.constants.HashZero);
    });

    it("Account does not have any roles by default", async () => {
      const randomSigner = (await ethers.getSigners())[1];
      const roles = await usdc.connect(randomSigner).getRoles();
      expect(roles).to.be.empty;
    });

    it("Account is issued new roles", async () => {
      const randomSigner = (await ethers.getSigners())[1];
      await usdc.grantRole(minterRole, randomSigner.address);
      let roles: string[];

      roles = await usdc.connect(randomSigner).getRoles();
      expect(roles.length).to.equal(1);
      expect(roles[0]).to.be.equal(minterRole);

      await usdc.grantRole(pauserRole, randomSigner.address);
      roles = await usdc.connect(randomSigner).getRoles();
      expect(roles.length).to.equal(2);
      expect(roles).to.include.members([minterRole, pauserRole]);
    });
  });
});
