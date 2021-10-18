import { parseEther } from "@ethersproject/units";
import { ChainId, useContractCall, useEthers } from "@usedapp/core";
import { chainReadProvider, isValidChain } from "config";
import { Staker, USDC } from "config";
import { utils } from "ethers";
import { useStakerInfo, useTokenInfo } from "hooks";
import { useRoles } from "hooks";
import React, { useState } from "react";

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
  const { userRoles, grantMinterRole, grantPauserRole } = useRoles();
  const isPaused = useContractCall({
    abi: USDC.interface,
    address: USDC.address,
    method: "paused",
    args: [],
  });
  const [targetAccount, setTargetAccount] = useState<string | undefined>();

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
          <p>
            <span className="font-bold text-blue-500">Roles:</span>{" "}
            {userRoles.length > 0 ? userRoles.join(", ") : "None"}
          </p>
          <h3 className="mt-12 mb-3 text-xl font-bold">USDC contract</h3>
          <p>
            <span className="font-bold text-blue-500">Paused:</span>{" "}
            {isPaused?.[0] ? "Yes" : "No"}
          </p>
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
          {userRoles.includes("ADMIN") && (
            <>
              <h3 className="mt-12 mb-3 text-xl font-bold">Admin panel</h3>
              <input
                type="text"
                className="block w-full px-4 py-2 mb-3 rounded-sm outline-none appearance-none ring-2"
                placeholder="0x12.."
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value)}
              />
              <div className="flex gap-5">
                <button
                  className="block px-4 py-2 text-white bg-green-500 rounded-sm"
                  onClick={() =>
                    targetAccount && grantMinterRole(targetAccount)
                  }
                >
                  Grant minter role
                </button>
                <button
                  className="block px-4 py-2 text-white bg-green-500 rounded-sm"
                  onClick={() =>
                    targetAccount && grantPauserRole(targetAccount)
                  }
                >
                  Grant pauser role
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IndexPage;
