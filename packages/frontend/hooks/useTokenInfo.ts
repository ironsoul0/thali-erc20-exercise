import { useContractFunction, useEthers } from "@usedapp/core";
import { BigNumber, utils } from "ethers";
import { useTokenContract } from "hooks";
import { useCallback, useEffect, useState } from "react";

export const useTokenInfo = (spenderAddress?: string) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const [allowance, setAllowance] = useState({
    loading: false,
    value: BigNumber.from(0),
  });
  const tokenContract = useTokenContract();
  const { account } = useEthers();

  const { state: mintState, send: sendMint } = useContractFunction(
    tokenContract as any,
    "freeMint"
  );
  const { state: increaseAllowanceState, send: increaseAllowance } =
    useContractFunction(tokenContract as any, "increaseAllowance");

  const fetchBalance = useCallback(async () => {
    if (!account) return;
    const userBalance = await tokenContract.balanceOf(account);
    setBalance(userBalance);
  }, [account, tokenContract]);

  const fetchAllowance = useCallback(async () => {
    if (!account || !spenderAddress) return;

    setAllowance((allowance) => ({
      ...allowance,
      loading: true,
    }));
    const userAllowance = await tokenContract.allowance(
      account,
      spenderAddress
    );
    setAllowance({
      value: userAllowance,
      loading: false,
    });
  }, [account, spenderAddress, tokenContract]);

  const freeMint = useCallback(async () => {
    sendMint(utils.parseEther("1337"));
  }, [sendMint]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (mintState.status === "Success") {
      fetchBalance();
    }
  }, [mintState, fetchBalance]);

  useEffect(() => {
    fetchAllowance();
  }, [fetchAllowance]);

  useEffect(() => {
    if (increaseAllowanceState.status === "Success") {
      fetchAllowance();
    }
  }, [fetchAllowance, increaseAllowanceState]);

  return {
    balance,
    allowance,
    freeMint,
    increaseAllowance,
    fetchBalance,
    fetchAllowance,
  };
};
