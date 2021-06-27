//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8;

abstract contract TOKENCONTRACT {

  function transfer(address _to, uint256 _amount) virtual public;
}

contract massSend {

  address public owner;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  constructor() {
    owner = msg.sender;
  }

  function send(address[] memory _receivers, uint[] memory _amounts, address contractAdress) public onlyOwner {
    TOKENCONTRACT tk = TOKENCONTRACT(contractAdress);
    for(uint i = 0; i< _receivers.length; i++) {
      tk.transfer(_receivers[i], _amounts[i]);
    }
  }

  function setOwner(address _owner) public onlyOwner {
    owner = _owner;
  }


}
