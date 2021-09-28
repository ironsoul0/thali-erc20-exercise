//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

import "./USDC.sol";

contract Staker is Ownable {
  using SafeMath for uint256;

  USDC public tokenAddress;
  uint256 public treasuryAmount;

  mapping(address => uint256) public lastDeposited;
  mapping(address => uint256) public depositedAmount;

  constructor(address _tokenAddress) {
    tokenAddress = USDC(_tokenAddress);
  }

  function depositTokens(uint256 amount) public {
    require(
      tokenAddress.allowance(msg.sender, address(this)) >= amount,
      "Tokens were not allowed to be spent"
    );

    uint256 fee = amount.mul(2).div(1000);
    treasuryAmount += fee;

    lastDeposited[msg.sender] = block.timestamp;
    depositedAmount[msg.sender] += amount.sub(fee);
    tokenAddress.transferFrom(msg.sender, address(this), amount);
  }

  function withdrawTokens(uint256 amount) public {
    require(
      depositedAmount[msg.sender] >= amount,
      "Insufficient funds deposited"
    );

    require(
      block.timestamp - lastDeposited[msg.sender] >= 2 hours,
      "Allowed to withdraw only after 2 hours"
    );

    tokenAddress.transfer(msg.sender, amount);
    depositedAmount[msg.sender] -= amount;
  }
}
