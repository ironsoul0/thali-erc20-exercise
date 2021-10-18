import { useEthers } from "@usedapp/core";
import { chainReadProvider, Staker } from "config";
import { Contract } from "ethers";
import { useMemo } from "react";

import { Staker as StakerContract } from "../types/typechain";

export const useStakerContract = () => {
  const { library } = useEthers();

  return useMemo(() => {
    return new Contract(
      Staker.address,
      Staker.abi,
      library ? library.getSigner() : chainReadProvider
    ) as StakerContract;
  }, [library]);
};
