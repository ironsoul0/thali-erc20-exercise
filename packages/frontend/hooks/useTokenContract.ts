import { useEthers } from "@usedapp/core";
import { chainReadProvider, USDC } from "config";
import { Contract } from "ethers";
import { useMemo } from "react";

import { USDC as USDCContract } from "../types/typechain";

export const useTokenContract = () => {
  const { library } = useEthers();

  return useMemo(() => {
    return new Contract(
      USDC.address,
      USDC.abi,
      library ? library.getSigner() : chainReadProvider
    ) as USDCContract;
  }, [library]);
};
