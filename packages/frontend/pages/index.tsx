import { parseEther } from "@ethersproject/units";
import {
  ChainId,
  useContractCall,
  useContractFunction,
  useEthers,
} from "@usedapp/core";
import { isValidChain, readOnlyUrls, TARGET_CHAIN } from "config";
import { Staker, USDC } from "config/contracts";
import { BigNumber, Contract, providers, utils } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Staker as StakerContract,
  USDC as USDCContract,
} from "../types/typechain";

export const chainReadProvider = new providers.StaticJsonRpcProvider(
  readOnlyUrls[TARGET_CHAIN]
);

const useTokenContract = () => {
  const { library } = useEthers();

  return useMemo(() => {
    return new Contract(
      USDC.address,
      USDC.abi,
      library ? library.getSigner() : chainReadProvider
    ) as USDCContract;
  }, [library]);
};

const useStakerContract = () => {
  const { library } = useEthers();

  return useMemo(() => {
    return new Contract(
      Staker.address,
      Staker.abi,
      library ? library.getSigner() : chainReadProvider
    ) as StakerContract;
  }, [library]);
};

const useTokenInfo = (spenderAddress?: string) => {
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

const useStakerInfo = <T extends () => Promise<void>>(
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

const IndexPage = () => {
  const { activateBrowserWallet, account, chainId } = useEthers();
  const {
    balance: usdcBalance,
    freeMint,
    allowance,
    increaseAllowance,
    fetchBalance,
    fetchAllowance,
  } = useTokenInfo(Staker.address);
  const { depositedAmount, sendDeposit, withdrawDeposit } = useStakerInfo(
    fetchBalance,
    fetchAllowance
  );
  const [userDeposit, setUserDeposit] = useState<number | undefined>();
  // const [tokenBalance] = useContractCall(
  //   account && {
  //     abi: USDC.interface,
  //     address: USDC.address,
  //     method: "balanceOf",
  //     args: [account],
  //   }
  // );

  const sendEth = () => {
    if (!account) return;

    const signer = chainReadProvider.getSigner();
    signer.sendTransaction({ value: parseEther("1"), to: account });
  };

  if (chainId && !isValidChain(chainId)) {
    return (
      <div className="max-w-lg py-4 mx-auto">
        <p className="text-red-400">
          You are connected to the wrong network. Please connect to Ropsten.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg py-4 mx-auto">
      {!account ? (
        <button
          className="block px-4 py-2 m-auto mt-2 text-white bg-blue-500 rounded-sm"
          onClick={() => activateBrowserWallet()}
        >
          Please connect account
        </button>
      ) : (
        <div>
          <h3 className="mt-4 mb-3 text-xl font-bold">Your account</h3>
          <p>
            <span className="font-bold text-blue-500">Connected account:</span>{" "}
            {account.substr(0, 7).concat("...")}
          </p>
          <p>
            <span className="font-bold text-blue-500">Chain ID:</span> {chainId}
          </p>
          <h3 className="mt-12 mb-3 text-xl font-bold">USDC contract</h3>
          <p>
            <span className="font-bold text-blue-500">My USDC balance:</span>{" "}
            {utils.formatEther(usdcBalance)}
          </p>
          <div className="flex">
            {chainId === ChainId.Hardhat && (
              <button
                className="block px-4 py-2 mt-3 mr-4 text-white bg-indigo-500 rounded-sm"
                onClick={sendEth}
              >
                Get 1 ETH
              </button>
            )}
            <button
              className="block px-4 py-2 mt-3 text-white bg-green-500 rounded-sm"
              onClick={freeMint}
            >
              Mint 1337 USDC
            </button>
          </div>
          <h3 className="mt-12 mb-3 text-xl font-bold">Staker contract</h3>
          <p>
            <span className="font-bold text-blue-500">
              Allowance to spend your USDC:
            </span>{" "}
            {utils.formatEther(allowance.value)}
          </p>
          <p>
            <span className="font-bold text-blue-500">Total deposited:</span>{" "}
            {utils.formatEther(depositedAmount.deposit)}
          </p>
          <p>
            <span className="font-bold text-blue-500">Treasury:</span>{" "}
            {utils.formatEther(depositedAmount.treasury)}
          </p>
          <button
            className="block px-4 py-2 mt-3 text-white bg-green-500 rounded-sm"
            onClick={() =>
              increaseAllowance(Staker.address, utils.parseEther("50"))
            }
          >
            Increase allowance by 50.0 USDC
          </button>
          <div className="flex items-center mt-4">
            <input
              type="number"
              className="px-4 py-2 rounded-sm outline-none appearance-none ring-2"
              placeholder="10"
              value={userDeposit}
              onChange={(e) => setUserDeposit(parseInt(e.target.value))}
            />
            <button
              className="block px-4 py-2 ml-4 text-white bg-green-500 rounded-sm"
              onClick={() =>
                userDeposit &&
                sendDeposit(utils.parseEther(userDeposit.toString()))
              }
            >
              Deposit
            </button>
          </div>
          <button
            className="block px-4 py-2 mt-4 text-white bg-red-400 rounded-sm w-100"
            onClick={withdrawDeposit}
          >
            Withdraw everything
          </button>
        </div>
      )}
    </div>
  );
};

export default IndexPage;
