const Create2 = artifacts.require("Create2");
var assert = require('assert');

//import util functions
const commonFunctions = require('./common.js');
const setSenderAddress = commonFunctions.setSenderAddress;
const setExpectedAddress = commonFunctions.setExpectedAddress;


contract('Create2', async accounts =>  {
  it('Contract should be deployed and addresses should match', async () => {
    //deploys create2 contract 
    const creatorContract = await Create2.deployed();
    
    //set sender address
    let { senderAddr, childByteCode } = await setSenderAddress(creatorContract);

    //set expected address
    let { expectedAddress, address, txResponse } = await setExpectedAddress(creatorContract, senderAddr, childByteCode, 0);
    
    //assert transaction was executed OK
    assert.ok(txResponse.receipt.status);
    
    //assert contract was created at given address
    let codeContract = await web3.eth.getCode(address);
    assert.equal(codeContract, await creatorContract.getRuntimeCode());
    
    //assert addresses are equal
    assert.equal(address.toLowerCase(), expectedAddress);
  });

  it('Duplicated contract should not be created', async () => {
    //deploys create2 contract 
    const creatorContractFail = await Create2.deployed();
    
    //set sender address
    let { senderAddr, childByteCode } = await setSenderAddress(creatorContractFail);

    //check duplicated contract is not created
    try {
      await setExpectedAddress(creatorContractFail, senderAddr, childByteCode, 0);
    } 
    catch {
      assert.ok('Duplicated contract was not created');
      return;
    }
    assert.fail('Duplicated contract was created');
  });
});
