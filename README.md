# Isolated RSK blockchain network

## Requirements

  * [Docker Compose](https://docs.docker.com/compose/) >= 1.14.0

## Building

You must provide two rskj builds:

  * `rskj-core-1.2.1-WASABI-all.jar`
  * `rskj-core-1.3.0-WASABI-all.jar`
  * `rskj-core-2.0.0-SNAPSHOT-all.jar`

Once in place, you can run the tests with:

```shell
$ ./test.sh
```

## Environment:

  * 4 full **regtest** nodes
  * wasabiPlusOne (Name TBD) network upgrade enabled from block number 65
  * JSONRPC interface enabled for each node, bound to local ports from 14440 (miner node) to 14443
  * All nodes accept `eth` JSONRPC calls
  * **miner** node is an _autominer_
  * **miner** node accepts `evm` JSONRPC calls (e.g. `evm_mine`)

## Additional considerations

  * For the automine feature to work, the transaction must be sent to the **miner** node
  * You can change the nodes starting version by setting the `cmd` configuration option for the service you want to start in a different version (i.e. `1.3.0-WASABI`)
  * You can change _Second fork (TBD)_ network upgrade activation block number by changing the `blockchain.config.hardforkActivationHeights.wasabi100` environment variable from `docker-compose*.yml files`
