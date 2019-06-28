pragma solidity ^0.5.8;
import "./Child.sol";

contract Create2 {

	address senderAddr;

	function createOneContract(uint256 salt, bytes memory code) public returns (address){
		address addr;
		senderAddr = msg.sender;
		assembly {
			addr := create2(0, add(code, 0x20), mload(code), salt)
		}
		return addr;
	}

    function getCreationCode() public pure returns (bytes memory) {
        bytes memory code = type(Child).creationCode;
        return code;
    }

    function getRuntimeCode() public pure returns (bytes memory) {
        bytes memory code = type(Child).runtimeCode;
        return code;
    }

}
