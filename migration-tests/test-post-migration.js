const chai = require('chai');
const expect = chai.expect;
const Web3 = require('web3');
const sleep = require('util').promisify(setTimeout);
const assert = require('chai').assert;
const BN = require('bignumber.js');
const fs = require('fs');
const path = require('path');

describe('Migration tests', function () {
  // catching up takes quite a lot of time
  this.timeout(20000);
  let web3Full1;
  let web3Full2;
  let web3Full3;
  let web3Miner;
  let PRIVATE_KEY = '0xc85ef7d79691fe79573b1a7064c19c1a9819ebdbd1faaab1a8ec92344438aaf4'; //cow
  let testAccount = '0x0000000000000000000000000000000001000006';
  let contractAddress = '';
  let trxHash = '';

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

  it('Activate 2.0(HF) at block number 65', async () => {
    for (let i = 0; i < 10; i++) {
      await web3Miner.evm.mine();
    }
    const blockNumber = await web3Full1.eth.getBlockNumber();
    expect(blockNumber).to.be.greaterThan(64);
  });

  it('WASABI nodes stuck at block 64', async () => {
    for (let i = 0; i < 10; i++) {
      await web3Miner.evm.mine();
    }
    const blockNumber4 = await web3Miner.eth.getBlockNumber();
    const blockNumber3 = await web3Full3.eth.getBlockNumber();
    const blockNumber2 = await web3Full2.eth.getBlockNumber();
    const blockNumber1 = await web3Full1.eth.getBlockNumber();
    expect(blockNumber2).to.be.equal(64);
    expect(blockNumber3).to.be.equal(64);
    console.log("-------------------------------------------------------------------");
    console.log("    Miner node (Papyrus 2.0) endend at block:" + blockNumber4) ;
    console.log("    Full node # 1 (Papyrus 2.0) endend at block:" + blockNumber1) ;
    console.log("    Full node # 2 (WASABI 1.2.1) endend at block:" + blockNumber2) ;
    console.log("    Full node # 3 (WASABI 1.3.0) endend at block:" + blockNumber3) ;
    console.log("-------------------------------------------------------------------");

    });
    it('Should have all the simple cached methods work', async () => {
      this.timeout(20000);

      // eth_hashrate
      let hashRate = await web3Full1.eth.getHashrate();
      assert.equal(hashRate, '0');
  
      // eth_syncing
      let isSyncing = await web3Full1.eth.isSyncing();
      if (typeof isSyncing === 'object') {
        assert.containsAllKeys(isSyncing, ['currentBlock', 'highestBlock', 'startingBlock']);
        assert.isAbove(isSyncing.currentBlock, 0);
        assert.isAbove(isSyncing.highestBlock, 0);
        assert.isAbove(isSyncing.startingBlock, 0);
      } else {
        assert.equal(isSyncing, false);
      }
  
      // net_version
      let networkId = await web3Miner.eth.net.getId();
      assert.equal(networkId, 33);
  
      // eth_accounts
      let accounts = await web3Full1.eth.getAccounts();
      assert.isArray(accounts);
  
      // eth_protocolVersion
      let protocolVersion = await web3Full1.eth.getProtocolVersion();
      assert.equal(protocolVersion, '62');
  
      // eth_mining
      let isMining = await web3Miner.eth.isMining();
      assert.equal(isMining, true);
  
    });
  
    // eth_blockNumber
    it('eth_blockNumber: Should get the current block number', async () => {
      let blockNumber = await web3Full1.eth.getBlockNumber();
      assert.isAbove(blockNumber, 4);
    });
  
    // eth_gasPrice
    it('eth_gasPrice: Should get the gas price', async () => {
      let gasPrice = new BN(await web3Full1.eth.getGasPrice());
      assert.equal(gasPrice.toNumber(), '0');
    });
  
    // eth_getTransactionCount
    it('eth_getTransactionCount: Should get an accounts transaction count', async () => {
      let transactionCount = await web3Full1.eth.getTransactionCount(
        testAccount,
        'latest'
      );
      assert.equal(transactionCount, '0');
    });
  
    // eth_getBalance
    it('eth_getBalance: Should get a the right balance for an account', async () => {
      let balance = new BN(await web3Full1.eth.getBalance(
        testAccount,
        'latest'
      ));
      assert.equal(balance.toNumber(), '21000000000000000000000000');
  
      let historicBalance = new BN(await web3Full1.eth.getBalance(
        testAccount,
        0
      ));
      let expectedHistoricBalance = new BN(21000000000000000000000000);
      assert.equal(historicBalance.minus(expectedHistoricBalance).toNumber(), 0);
  
      let unusedAccountBalance = new BN(await web3Full1.eth.getBalance(
        '0x09a1eda29f664ac8f68106f6567276df0c65d859',
        'latest'
      ));
      assert.equal(unusedAccountBalance.toNumber(), '1000000000000000000000000000000');

    });
  
    // eth_getTransactionByBlockHashAndIndex
    // eth_getTransactionByBlockNumberAndIndex
    it('eth_getTransactionByBlockHashAndIndex-eth_getTransactionByBlockNumberAndIndex: Should get transactions by block number and hash', async () => {
      let blockNumber = 1;
      let byBlockNumber = await web3Full1.eth.getTransactionFromBlock(blockNumber, 0);
      let blockHash = byBlockNumber.blockHash;
      let byHash = await web3Full1.eth.getTransactionFromBlock(blockHash, 0);
  
      assert.deepEqual(byBlockNumber, byHash);
  
      let invalidBlock = await web3Full1.eth.getTransactionFromBlock('0xdeadbeef0fb9424aad2417321cac62915f6c83827f4d3c8c8c06900a61c4236c', 0);
      assert.isNull(invalidBlock);
    });
  
    // eth_getBlockTransactionCountByHash
    // eth_getBlockTransactionCountByNumber
    it(`eth_getBlockTransactionCountByHash-eth_getBlockTransactionCountByNumber: Should return the right number of block transactions`, async () => {
      let expectedCount = 2;
      let blockNumber = 4;
      let byBlockNumber = await web3Full1.eth.getTransactionFromBlock(blockNumber, 0);
      let blockHash = byBlockNumber.blockHash;
  
      let byHash = await web3Full1.eth.getBlockTransactionCount(blockHash);
      assert.equal(byHash, expectedCount);
  
      let byNumber = await web3Full1.eth.getBlockTransactionCount(blockNumber);
      assert.equal(byNumber, expectedCount);
    });
  
    //eth_call 
    //eth_sendRawTransaction
    it('eth_sendRawTransaction & eth_call: Should compile and deploy a contract successfully and interact with that contract', async function () {
      this.timeout(20000);

      let compiledHelloWorldPath = path.resolve(__dirname, '/', 'HelloWorld.json');
      let compiledContract = fs.readFileSync(compiledHelloWorldPath, 'UTF-8');
      let contractOutput = JSON.parse(compiledContract);
      let abi = contractOutput.abi;
      let contract = new web3Miner.eth.Contract(abi);
      let signedAccount = web3Miner.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
      let deployment = contract.deploy({ data: '0x6080604052600560005534801561001557600080fd5b5060ff806100246000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b606860c1565b6040518082815260200191505060405180910390f35b806000819055507f93fe6d397c74fdf1402a8b72e47b68512f0510d7b98a4bc4cbdf6ac7108b3c596000546040518082815260200191505060405180910390a150565b6000805490509056fea265627a7a72305820c73a787ed29a46f8a85631abd07c906d900ca03c03b631cc85fe396408072ee164736f6c634300050a0032', arguments: [] });
  
      let contractData = deployment.encodeABI();
  
      let transaction = {
        value: 0,
        gasPrice: web3Miner.utils.toHex(10000000),
        gas: web3Miner.utils.toHex(1000000),
        data: contractData,
        chainId: 33
      };
  
      let signedTx = await signedAccount.signTransaction(transaction);
      let txReceipt = await web3Miner.eth.sendSignedTransaction(signedTx.rawTransaction);
      assert(txReceipt.contractAddress);
     contractAddress = txReceipt.contractAddress;
  
      let deployedContract = new web3Miner.eth.Contract(abi, txReceipt.contractAddress);
  
      let getCall = deployedContract.methods.get();
      let callParams = {
        to: txReceipt.contractAddress,
        data: getCall.encodeABI(),
      };
  
      let currentVal = await web3Miner.eth.call(callParams);
      assert.equal(currentVal, '0x0000000000000000000000000000000000000000000000000000000000000005');
  
      let currentValLatest = await web3Miner.eth.call(callParams, "latest");
      assert.equal(currentValLatest, '0x0000000000000000000000000000000000000000000000000000000000000005');
  
      let currentValPending = await web3Miner.eth.call(callParams, "pending");
      assert.equal(currentValPending, '0x0000000000000000000000000000000000000000000000000000000000000005');
  
      let setCall = deployedContract.methods.set(34);
      let setGasEstimate = await setCall.estimateGas({ from: signedAccount.address });
      let transactionParameters = {
        to: txReceipt.contractAddress,
        from: signedAccount.address,
        gasPrice: '0x4A817C800', // 20000000000
        gas: setGasEstimate,
        data: setCall.encodeABI(),
        chainId: 33
      };
  
      let setSignedTx = await signedAccount.signTransaction(transactionParameters);
  
      // Send the transaction.
      let receipt = await web3Miner.eth.sendSignedTransaction(setSignedTx.rawTransaction)
        .once('transactionHash', (hash) => {
          assert.isString(hash);
          trxHash = hash;
        })
        .on('error', (error) => {
          assert(false, `Unexpected error sending set transaction: $`);
        });
      assert.isObject(receipt);
      let receiptString = JSON.stringify(receipt);
      assert(receiptString.indexOf('transactionHash') > 0, "transactionHash is not being returned and it's expected!");
      assert(receiptString.indexOf('transactionIndex') > 0, "transactionIndex is not being returned and it's expected!");
      assert(receiptString.indexOf('blockHash') > 0, "blockHash is not being returned and it's expected!");
      assert(receiptString.indexOf('blockNumber') > 0, "blockNumber is not being returned and it's expected!");
      assert(receiptString.indexOf('cumulativeGasUsed') > 0, "cumulativeGasUsed is not being returned and it's expected!");
      assert(receiptString.indexOf('gasUsed') > 0, "gasUsed is not being returned and it's expected!");
      assert(receiptString.indexOf('contractAddress') > 0, "contractAddress is not being returned and it's expected!");
      assert(receiptString.indexOf('logs') > 0, "logs is not being returned and it's expected!");
      assert(receiptString.indexOf('from') > 0, "from is not being returned and it's expected!");
      assert(receiptString.indexOf('to') > 0, "to is not being returned and it's expected!");
      assert(receiptString.indexOf('root') > 0, "root is not being returned and it's expected!");
      assert(receiptString.indexOf('status') >0, "status is not being returned and it's expected!");
      assert(receiptString.indexOf('logsBloom') > 0, "logsBloom is not being returned and it's expected!");
  
      await new Promise((res) => setTimeout(res, 5000));
  
      await deployedContract.getPastEvents('ValueChanged', { fromBlock: 0, toBlock: 'latest' }, (error, eventLogs) => {
        assert(!error, `Unexpected error reading logs ${error}`);
        assert.equal(eventLogs[0].returnValues.newValue, "34");
      });
    });
  
    // eth_getCode
    it(`eth_getCode: Should return the contract's code`, async () => {
      let contractCode = await web3Full1.eth.getCode(contractAddress, 'latest');
      assert.equal(contractCode, '0x6080604052348015600f57600080fd5b506004361060325760003560e01c806360fe47b11460375780636d4ce63c146062575b600080fd5b606060048036036020811015604b57600080fd5b8101908080359060200190929190505050607e565b005b606860c1565b6040518082815260200191505060405180910390f35b806000819055507f93fe6d397c74fdf1402a8b72e47b68512f0510d7b98a4bc4cbdf6ac7108b3c596000546040518082815260200191505060405180910390a150565b6000805490509056fea265627a7a72305820c73a787ed29a46f8a85631abd07c906d900ca03c03b631cc85fe396408072ee164736f6c634300050a0032');
      let accountCount = await web3Full1.eth.getCode(testAccount, 'earliest');
      assert.equal('0x00', accountCount);
  
      let invalidAccount = await web3Full1.eth.getCode('0x0000000000000000000000000000000000000001', 'latest');
      assert.equal('0x00', invalidAccount);
    });
  
    // eth_getBlockByHash
    // eth_getBlockByNumber
    it(`eth_getBlockByHash-eth_getBlockByNumber: Should get the block by hash and number`, async () => {
      this.timeout(20000);
      let blockNumber = '2';
      let byNumber = await web3Full1.eth.getBlock(blockNumber);
      let blockHash = byNumber.hash;
      let byHash = await web3Full1.eth.getBlock(blockHash);
  
      assert.deepEqual(byHash, byNumber);
  
      let withTransactions = await web3Full1.eth.getBlock(blockHash, true);
      assert.equal(withTransactions.transactions.length, 2);
      assert.isObject(withTransactions.transactions[0]);
    });
  
    // eth_getTransactionByHash
    it(`eth_getTransactionByHash: Should get a transaction by its hash`, async () => {
      let tx = await web3Full1.eth.getTransaction(trxHash);
      assert.isObject(tx);
      let txString = JSON.stringify(tx);
      assert(txString.indexOf('hash') > 0, "hash is not being returned and it's expected!");
      assert(txString.indexOf('transactionIndex') > 0, "transactionIndex is not being returned and it's expected!");
      assert(txString.indexOf('blockHash') > 0, "blockHash is not being returned and it's expected!");
      assert(txString.indexOf('blockNumber') > 0, "blockNumber is not being returned and it's expected!");
      assert(txString.indexOf('value') > 0, "value is not being returned and it's expected!");
      assert(txString.indexOf('input') > 0, "input is not being returned and it's expected!");
      assert(txString.indexOf('from') > 0, "from is not being returned and it's expected!");
      assert(txString.indexOf('to') > 0, "to is not being returned and it's expected!");
      assert(txString.indexOf('gasPrice') > 0, "gasPrice is not being returned and it's expected!");
      assert(txString.indexOf('gas') > 0, "gas is not being returned and it's expected!");
      assert(txString.indexOf('"v"') > 0, "v: is not being returned and it's expected!");
      assert(txString.indexOf('"r"') > 0, "r: is not being returned and it's expected!");
      assert(txString.indexOf('"s"') > 0, "s: is not being returned and it's expected!");
  
      let invalidTx = await web3Full1.eth.getTransaction('0x5eae996aa609c0b9db434c7a2411437fefc3ff16046b71ad102453cfdeadbeef');
      assert.isNull(invalidTx);
    });
  
    // eth_getTransactionReceipt
    it(`eth_getTransactionReceipt: Should get transaction receipt`, async () => {
  
      let receipt = await web3Full1.eth.getTransactionReceipt(trxHash);
      assert.isObject(receipt);
      let receiptString = JSON.stringify(receipt);
      assert(receiptString.indexOf('transactionHash') >= 0, "transactionHash is not being returned and it's expected!");
      assert(receiptString.indexOf('transactionIndex') >= 0, "transactionIndex is not being returned and it's expected!");
      assert(receiptString.indexOf('blockHash') >= 0, "blockHash is not being returned and it's expected!");
      assert(receiptString.indexOf('blockNumber') >= 0, "blockNumber is not being returned and it's expected!");
      assert(receiptString.indexOf('cumulativeGasUsed') >= 0, "cumulativeGasUsed is not being returned and it's expected!");
      assert(receiptString.indexOf('gasUsed') >= 0, "gasUsed is not being returned and it's expected!");
      assert(receiptString.indexOf('contractAddress') >= 0, "contractAddress is not being returned and it's expected!");
      assert(receiptString.indexOf('logs') >= 0, "logs is not being returned and it's expected!");
      assert(receiptString.indexOf('from') >= 0, "from is not being returned and it's expected!");
      assert(receiptString.indexOf('to') >= 0, "to is not being returned and it's expected!");
      assert(receiptString.indexOf('root') >= 0, "root is not being returned and it's expected!");
      assert(receiptString.indexOf('status') >= 0, "status is not being returned and it's expected!");
      assert(receiptString.indexOf('logsBloom') >= 0, "logsBloom is not being returned and it's expected!");
      let invalidTx = await web3Full1.eth.getTransactionReceipt('0xd05274b72ca6346bcce89a64cd42ddd28d885fdd06772efe0fe7d19fdeadbeef');
      assert.isNull(invalidTx);
    });
  
    // eth_getStorageAt
    it(`eth_getStorageAt: Should get storage at a specific location`, async () => {
      let storageValue = await web3Full1.eth.getStorageAt(
        contractAddress,
        0,
        'latest'
      );
  
      assert.equal(storageValue, '0x0000000000000000000000000000000000000000000000000000000000000022');
    });
  
    // eth_getLogs
    it(`eth_getLogs: Should get the logs of a contract`, async () => {
      let logs = await web3Full1.eth.getPastLogs({
        'fromBlock': "0x0",
        'toBlock': await web3Full1.eth.getBlockNumber(),
        'address': contractAddress,
      });
      assert.isObject(logs[0]);
      let logTrxHash = logs[0].transactionHash;
      assert.equal(logTrxHash, trxHash);
      let logsString = JSON.stringify(logs[0]);
      assert(logsString.indexOf('logIndex') >= 0, "logIndex: is not being returned and it's expected!");
      assert(logsString.indexOf('blockNumber') >= 0, "blockNumber: is not being returned and it's expected!");
      assert(logsString.indexOf('blockHash') >= 0, "blockHash: is not being returned and it's expected!");
      assert(logsString.indexOf('transactionIndex') >= 0, "transactionIndex: is not being returned and it's expected!");
      assert(logsString.indexOf('address') >= 0, "address: is not being returned and it's expected!");
      assert(logsString.indexOf('data') >= 0, "data: is not being returned and it's expected!");
      assert(logsString.indexOf('topics') >= 0, "topics: is not being returned and it's expected!");
      assert(logsString.indexOf('id') >= 0, "id: is not being returned and it's expected!");
      assert(logsString.indexOf('transactionHash') >= 0, "transactionHash is not being returned and it's expected!");
  
    });

    //eth_coinbase
    it(`eth_coinbase: Should return coinbase from RskJ`, async () => {
      let coinbase = await web3Full1.eth.getCoinbase();
      assert.equal(coinbase, '0x0000000000000000000000000000000000000000');
    });
  
});