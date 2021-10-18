import { keccak256 } from "@ethersproject/keccak256";
import { useContractFunction } from "@usedapp/core";
import { ethers } from "@usedapp/core/node_modules/ethers";
import { useTokenContract } from "hooks";
import { useCallback, useEffect, useState } from "react";

const AVAILABLE_ROLES = [
  {
    name: "ADMIN",
    hash: ethers.constants.HashZero,
  },
  {
    name: "MINTER",
    hash: keccak256(Buffer.from("MINTER_ROLE")),
  },
  {
    name: "PAUSER",
    hash: keccak256(Buffer.from("PAUSER_ROLE")),
  },
];

export const useRoles = () => {
  const usdcContract = useTokenContract();
  const [roles, setRoles] = useState<string[]>([]);

  const { send: sendGrantRole } = useContractFunction(
    usdcContract as any,
    "grantRole"
  );

  useEffect(() => {
    let cancelled = false;

    const fetchRoles = async () => {
      const userRoles = await usdcContract.getRoles();
      const normalizedRoles = userRoles.reduce<string[]>((acc, role) => {
        const match = AVAILABLE_ROLES.filter((x) => x.hash === role)[0];
        if (match) return [...acc, match.name];
        return acc;
      }, []);

      if (!cancelled) setRoles(normalizedRoles);
    };

    fetchRoles();

    return () => {
      cancelled = true;
    };
  }, [usdcContract]);

  const grantMinterRole = useCallback(
    (address: string) => {
      sendGrantRole(AVAILABLE_ROLES[1].hash, address);
    },
    [sendGrantRole]
  );

  const grantPauserRole = useCallback(
    (address: string) => {
      sendGrantRole(AVAILABLE_ROLES[2].hash, address);
    },
    [sendGrantRole]
  );

  return { userRoles: roles, grantMinterRole, grantPauserRole };
};
