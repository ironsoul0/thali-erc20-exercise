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

  constructor(uint256 initialSupply, address admin)
    ERC20("USD Stablecoin", "USDC")
  {
    _setupRole(DEFAULT_ADMIN_ROLE, admin);
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

  /**
   * @dev Function which returns all roles that user has
   */
  function getRoles() public view returns (bytes32[] memory) {
    uint256 totalRoles = 0;
    bytes32[3] memory availableRoles = [
      DEFAULT_ADMIN_ROLE,
      MINTER_ROLE,
      PAUSER_ROLE
    ];

    for (uint256 i = 0; i < availableRoles.length; i++) {
      if (hasRole(availableRoles[i], msg.sender)) {
        totalRoles++;
      }
    }

    bytes32[] memory userRoles = new bytes32[](totalRoles);
    uint256 roleCounter = 0;
    for (uint256 i = 0; i < availableRoles.length; i++) {
      if (hasRole(availableRoles[i], msg.sender)) {
        userRoles[roleCounter++] = availableRoles[i];
      }
    }

    return userRoles;
  }
}
