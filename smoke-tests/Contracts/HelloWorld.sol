pragma solidity ^0.5.9;
contract HelloWorld {
    uint a = 5;
    event ValueChanged(uint newValue);

    function set(uint b) public {
        a = b;
       emit ValueChanged(a);
    }

    function get()  public view returns (uint){
        return a;
    }
}