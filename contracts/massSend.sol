//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

interface IERC20 {
  function transfer(address _to, uint256 _amount) external;
}

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

  function send(address[] memory _receivers, uint[] memory _amounts, IERC20 token) public onlyOwner {
    if(_receivers.length != _amounts.length) revert WrongArraysLength();
    for(uint i = 0; i< _receivers.length; i++) {
      token.transfer(_receivers[i], _amounts[i]);
    }
  }

  function setOwner(address _owner) public onlyOwner {
    owner = _owner;
  }
}
