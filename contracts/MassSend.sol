// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {IERC20} from "./interfaces/IERC20.sol";

contract MassSend {
    error WrongArraysLength();
    error OnlyOwner();

    address public owner;

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function send(
        address[] calldata _receivers,
        uint256[] calldata _amounts,
        address _token
    ) external onlyOwner {
        if (_receivers.length != _amounts.length) revert WrongArraysLength();

        bytes4 selector = IERC20.transfer.selector;
        /// @solidity memory-safe-assembly
        assembly {
          let data := mload(0x40)
          mstore(data, selector)
          for {
            let len := _receivers.length
            let i
            let rOffs := _receivers.offset
            let aOffs := _amounts.offset
          } lt(i, len) {
            i := add(i, 0x01)
            rOffs := add(rOffs, 0x20)
            aOffs := add(aOffs, 0x20)
          } {
            mstore(add(data, 0x04), calldataload(rOffs))
            mstore(add(data, 0x24), calldataload(aOffs))

            let success := call(gas(), _token, 0, data, 0x44, 0x0, 0x20)
            if iszero(success) {
              returndatacopy(add(data, 0x04), 0, returndatasize())
              revert(add(data, 0x04), returndatasize())
            }
          }
        }
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }
}
