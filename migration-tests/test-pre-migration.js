const chai = require('chai');
const expect = chai.expect;
const Web3 = require('web3');

const PRIVATE_KEY = '0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4'; //cow

describe('Migration tests', function () {
  this.timeout(20000);
  let web3;

  before(async () => {
    web3 = new Web3('http://miner:4444', null, {transactionConfirmationBlocks: 1});
    web3Full1 = new Web3('http://full1:4444', null, {transactionConfirmationBlocks: 1});
    web3Full2 = new Web3('http://full2:4444', null, {transactionConfirmationBlocks: 1});
    web3Full3 = new Web3('http://full3:4444', null, {transactionConfirmationBlocks: 1});
    web3.evm = {
      mine: () => web3.currentProvider.send('evm_mine')
    };
  });

  it('Must initiate in block number 0', async () => {
    const blockNumber = await web3.eth.getBlockNumber();
    expect(blockNumber).to.equal(0);
  });

  it('Must invoke all precompiled contracts', async () => {
    const userAccount = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    const precompiledContractAddresses = [
      ['0x0000000000000000000000000000000000000001', '0x01'], // ecrecover
      ['0x0000000000000000000000000000000000000002', undefined], // sha256
      ['0x0000000000000000000000000000000000000003', undefined], // ripemd160
      ['0x0000000000000000000000000000000000000004', undefined], // identity
      ['0x0000000000000000000000000000000000000005', undefined], // modexp
      ['0x0000000000000000000000000000000001000006', "0x0461313e0000000000000000000000000000000000000000000000000000000000000020"], // bridge.getFederationAddress
    ];
    for (const [precompiledContractAddress, hexData] of precompiledContractAddresses) {
      const receipt = await signAndSendTransaction(userAccount, precompiledContractAddress, hexData);
      expect(receipt.status, `${precompiledContractAddress} failed to execute`).to.be.true;
    }
  });

  it('Network should advance until block 50', async () => {
    let blockNumber = await web3.eth.getBlockNumber();
    for (let i = blockNumber; i < 50; i++) {
      await web3.evm.mine();
    }
    blockNumber = await web3.eth.getBlockNumber();
    let blockNumber3 = await web3Full3.eth.getBlockNumber();
    let blockNumber2 = await web3Full2.eth.getBlockNumber();
    let blockNumber1 = await web3Full1.eth.getBlockNumber();
    expect(blockNumber1).to.be.equal(50);
    expect(blockNumber2).to.be.equal(50);
    expect(blockNumber3).to.be.equal(50);
    expect(blockNumber).to.be.equal(50);
    console.log("-------------------------------------------------------------------");
    console.log("    Miner node (Papyrus 2.0) is at block:" + blockNumber) ;
    console.log("    Full node # 1 (WASABI 1.3.0) is at block:" + blockNumber1) ;
    console.log("    Full node # 2 (WASABI 1.2.1) is at block:" + blockNumber2) ;
    console.log("    Full node # 3 (WASABI 1.3.0) is at block:" + blockNumber3) ;
    console.log("-------------------------------------------------------------------");
  })

  const signAndSendTransaction = async (account, destination, hexData) => {
    const identityCallTx = await account.signTransaction({
      to: destination,
      data: hexData,
      gasPrice: web3.utils.toHex(10000000),
      gas: web3.utils.toHex(1000000),
      chainId: 33
    });
    return await web3.eth.sendSignedTransaction(identityCallTx.rawTransaction);
  };
});