// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import { IERC20 } from './interfaces/IERC20.sol';

contract massSend {
  error WrongArraysLength();
  error OnlyOwner();

  address public owner;

  modifier onlyOwner() {
    if(msg.sender != owner) revert OnlyOwner();
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function send(address[] calldata _receivers, uint256[] calldata _amounts, IERC20 token) external onlyOwner {
    if(_receivers.length != _amounts.length) revert WrongArraysLength();
    unchecked {
      for(uint256 i = 0; i < _receivers.length; i++) {
        token.transfer(_receivers[i], _amounts[i]);
      }
    }
  }

  function setOwner(address _owner) external onlyOwner {
    owner = _owner;
  }
}
