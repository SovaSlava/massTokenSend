// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import {IERC20} from "./interfaces/IERC20.sol";

contract massSend {
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

        assembly {
            mstore(
                0x00,
                0xa9059cbb00000000000000000000000000000000000000000000000000000000
            )
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
                mstore(0x04, calldataload(rOffs))
                mstore(0x24, calldataload(aOffs))
                if iszero(
                    call(gas(), _token, callvalue(), 0x00, 0x44, 0x60, 0x20)
                ) {
                    revert(0x00, 0x00)
                }

                // if iszero(mload(0x60)) {
                // revert(0x00, 0x00)
                // }
            }
        }
    }

    function setOwner(address _owner) external onlyOwner {
        owner = _owner;
    }
}
