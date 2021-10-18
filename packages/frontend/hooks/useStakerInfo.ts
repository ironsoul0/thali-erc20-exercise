import { useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { useStakerContract } from "hooks";
import { useCallback, useEffect, useState } from "react";

export const useStakerInfo = <T extends () => Promise<void>>(
  fetchBalance: T,
  fetchAllowance: T
) => {
  const { account } = useEthers();
  const stakerContract = useStakerContract();
  const [depositedAmount, setDepositedAmount] = useState({
    deposit: BigNumber.from(0),
    treasury: BigNumber.from(0),
  });
  const { state: depositState, send: sendDeposit } = useContractFunction(
    stakerContract as any,
    "depositTokens"
  );
  const { state: withdrawState, send: sendWithdraw } = useContractFunction(
    stakerContract as any,
    "withdrawTokens"
  );

  const fetchDeposit = useCallback(async () => {
    if (!account) return;
    const userDeposited = await stakerContract.depositedAmount(account);
    const treasuryAmount = await stakerContract.treasuryAmount();
    setDepositedAmount({ deposit: userDeposited, treasury: treasuryAmount });
  }, [account, stakerContract]);

  const withdrawDeposit = useCallback(async () => {
    sendWithdraw(depositedAmount.deposit);
  }, [sendWithdraw, depositedAmount]);

  useEffect(() => {
    fetchDeposit();
  }, [fetchDeposit]);

  useEffect(() => {
    if (depositState.status === "Success") {
      fetchDeposit();
      fetchBalance();
      fetchAllowance();
    }
  }, [depositState, fetchDeposit, fetchAllowance, fetchBalance]);

  useEffect(() => {
    if (withdrawState.status === "Success") {
      fetchDeposit();
      fetchBalance();
    }
  }, [withdrawState, fetchBalance, fetchDeposit]);

  return {
    depositedAmount,
    sendDeposit,
    withdrawDeposit,
  };
};
