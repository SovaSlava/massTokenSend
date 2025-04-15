// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;


contract MassSend {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }

    function send(
        address[] calldata _receivers,
        uint256[] calldata _amounts,
        address _token
    ) external  {
        assembly {
          let data := mload(0x40)

          // onlyOwner
          if iszero(eq(caller(), sload(0))) {
            mstore(0x0, 0x5fc483c500000000000000000000000000000000000000000000000000000000)
            revert(0x0,4)
          }
          // receiver'slength is equal to amount's length
          let receiversLength := _receivers.length
          if iszero(eq(receiversLength, _amounts.length)) {
            mstore(0x0, 0x4f32285a00000000000000000000000000000000000000000000000000000000) // error WrongArraysLength()
            revert(0x0,4)
          }
          // send
          mstore(data, 0xa9059cbb00000000000000000000000000000000000000000000000000000000) // IERC20.transfer.selector
          for {
            let len := receiversLength
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

            let success := and(
                or(and(eq(mload(0), 1), gt(returndatasize(), 31)), iszero(returndatasize())),
                call(gas(), _token, 0, data, 0x44, 0x0, 0x20)
            )

            if iszero(success) {
              returndatacopy(add(data, 0x04), 0, returndatasize())
              revert(add(data, 0x04), returndatasize())
            }
          }
        }
    }

error OnlyOwner();  
    function setOwner(address _owner) external {
      assembly {
        if iszero(eq(caller(), sload(0))) {
          mstore(0x0, 0x5fc483c500000000000000000000000000000000000000000000000000000000)
          revert(0x0,4)
        }
      sstore(0, _owner)
      }     
    }
}
