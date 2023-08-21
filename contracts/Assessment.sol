// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//import "hardhat/console.sol";

contract SimpleContract {
    address public owner;
    string public name;
    string public message;

    function setMessage(string memory _message) public {
        message = _message;
        owner = msg.sender;
        name = "Akanksha";
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}
