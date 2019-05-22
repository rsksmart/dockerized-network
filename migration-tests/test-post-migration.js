const chai = require('chai');
const expect = chai.expect;
const Web3 = require('web3');
const sleep = require('util').promisify(setTimeout)

describe('Migration tests', function () {
  // catching up takes quite a lot of time
  this.timeout(10000);
  let web3Full1;
  let web3Full2;
  let web3Full3;
  let web3Miner;

  before(async () => {
    web3Full1 = new Web3('http://full1:4444', null, {transactionConfirmationBlocks: 1});
    web3Full2 = new Web3('http://full2:4444', null, {transactionConfirmationBlocks: 1});
    web3Full3 = new Web3('http://full3:4444', null, {transactionConfirmationBlocks: 1});
    web3Miner = new Web3('http://miner:4444', null, {transactionConfirmationBlocks: 1});
    web3Miner.evm = {
      mine: () => web3Miner.currentProvider.send('evm_mine')
    };
  });

  it('Must catch up to block after migration', async () => {
    // this is here to trigger a sync, otherwise the node is stuck in long sync
    await web3Miner.evm.mine();

    let blockNumber;
    for (let i = 0; i < 10; i++) {
      blockNumber = await web3Full1.eth.getBlockNumber();
      if (blockNumber == 51) {
        break;
      }

      await sleep(500);
    }

    expect(blockNumber).to.be.equal(51);
  });

  it('Must sync with miner after a new block', async () => {
    for (let i = 0; i < 10; i++) {
      await web3Miner.evm.mine();
    }
    const blockNumber = await web3Full1.eth.getBlockNumber();
    expect(blockNumber).to.be.greaterThan(51);
  });

  it('Activate wasabi at block number 65', async () => {
    for (let i = 0; i < 10; i++) {
      await web3Miner.evm.mine();
    }
    const blockNumber = await web3Full1.eth.getBlockNumber();
    expect(blockNumber).to.be.greaterThan(64);
  });

  it('Orchid nodes stuck at block 64', async () => {
    const blockNumber2 = await web3Full2.eth.getBlockNumber();
    expect(blockNumber2).to.be.equal(64);
    const blockNumber3 = await web3Full3.eth.getBlockNumber();
    expect(blockNumber3).to.be.equal(64);
  });
});