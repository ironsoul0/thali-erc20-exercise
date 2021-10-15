//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract USDC is Pausable, ERC20, AccessControl {
  // Create a new role identifier for minter role
  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  // Create a new role identifier for pauser role
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

  constructor(uint256 initialSupply) ERC20("USD Stablecoin", "USDC") {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _mint(msg.sender, initialSupply);
  }

  /**
   * @dev Function to be used by minter role to mint new tokens
   */
  function freeMint(uint256 amount) public onlyRole(MINTER_ROLE) {
    _mint(msg.sender, amount);
  }

  /**
   * @dev Function to be used by pauser role to pause
   */
  function pause() public onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Function to be used by pauser role to unpause
   */
  function unpause() public onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  /**
   * @dev Function which will be executed before token transfer
   */
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override whenNotPaused {
    super._beforeTokenTransfer(from, to, amount);
  }
}
