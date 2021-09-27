//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract USDC is Ownable, Pausable, ERC20 {
  constructor(uint256 initialSupply) ERC20("USD Stablecoin", "USDC") {
    _mint(msg.sender, initialSupply);
  }

  function freeMint(uint256 amount) public {
    _mint(msg.sender, amount);
  }
}
