# Isolated RSK blockchain network

## Requirements

  * [Docker Compose](https://docs.docker.com/compose/) >= 1.14.0

## Building

You must provide two rskj builds:

  * `rskj-core-0.6.2-ORCHID-all.jar`
  * `rskj-core-1.0.0-PREVIEW-all.jar`

Once in place, you can run the tests with:

```shell
$ ./test.sh
```

## Environment:

  * 4 full **regtest** nodes
  * _Second fork (TBD)_ network upgrade enabled from block number 1000
  * JSONRPC interface enabled for each node, bound to local ports from 14440 (miner node) to 14443
  * All nodes accept `eth` JSONRPC calls
  * **miner** node is an _autominer_
  * **miner** node accepts `evm` JSONRPC calls (e.g. `evm_mine`)

## Additional considerations

  * For the automine feature to work, the transaction must be sent to the **miner** node
  * The nodes start by default on `1.0.0-PREVIEW` version. You can change it by setting the `cmd` configuration option for the service you want to start in a different version (i.e. `0.6.2-ORCHID`)
  * You can change _Second fork (TBD)_ network upgrade activation block number by changing the `blockchain.config.hardforkActivationHeights.wasabi100` environment variable from `envs/base.env`
