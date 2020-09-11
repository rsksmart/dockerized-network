var assert = require('assert');

function buildCreate2Address(creatorAddress, saltHex, byteCode) {
    return `0x${web3.utils.sha3(`0x${[
      'ff',
      creatorAddress.toLowerCase(),
      saltHex,
      web3.utils.sha3(byteCode)
    ].map(x => x.replace(/0x/, ''))
    .join('')}`).slice(-40)}`.toLowerCase()
}
  
function numberToUint256(value) {
    const hex = value.toString(16)
    return `0x${'0'.repeat(64-hex.length)}${hex}`
}
  
async function setSenderAddress(contract) {
    let senderAddr = contract.address;
    let childByteCode = await contract.getCreationCode();
    return { senderAddr, childByteCode };
}
  
async function setExpectedAddress(contract, senderAd, childBC, salt) {
    let expectedAddress = buildCreate2Address(senderAd, numberToUint256(salt), childBC);
    /* 
    Use .call() in order to get the address but not causing impact on the blockchain. 
    When calling createOneContract() without .call(), it impacts on the blockchain and the contract is actually deployed. 
    */
    let address = await contract.createOneContract.call(salt,childBC);
    let txResponse = await contract.createOneContract(salt,childBC);
    return { expectedAddress, address, txResponse };
}

module.exports = {
    buildCreate2Address: buildCreate2Address,
    numberToUint256: numberToUint256,
    setSenderAddress: setSenderAddress,
    setExpectedAddress: setExpectedAddress
}
