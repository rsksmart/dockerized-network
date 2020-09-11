pragma solidity ^0.5.0;

import "truffle/Assert.sol";

contract TestShift {
    function testShift1() public{
        uint x1 = 2;
        uint y1;
        assembly {y1 := shl(2, x1) }
        Assert.equal(y1, x1*4, "Test SHL should be equal to 8");

        uint y2;
        uint x2 = 8;
        assembly {y2 := shr(2, x2) }
        Assert.equal(y2, x2/4, "Test SHR should be equal to 2");


        int x3 = -8;
        int y3;
        assembly {y3 := sar(2, x3) }
        Assert.equal(y3, x3/4, "Test SHL should be equal to -2");
    }
}
