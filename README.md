# Isolated RSK blockchain network

## Requirements

  * [Docker Compose](https://docs.docker.com/compose/) >= 1.14.0

## Building

The environment can be built with:

```shell
$ docker-compose up -d
```

Once it finishes the nodes should be running in their respective containers

## Environment:

  * 4 full **regtest** nodes
  * JSONRPC interface enabled for each node, bound to local ports from 14440 (miner node) to 14443
  * All nodes accept `eth` JSONRPC calls
  * **miner** node is an _autominer_
  * **miner** node accepts `evm` JSONRPC calls (e.g. `evm_mine`)

## Additional considerations

  * For the automine feature to work, the transaction must be sent to the **miner** node
  * The nodes start by default on branch `master`. You can change it by setting the `arg_branch` configuration in the `docker-compose.yml` file for the service you want to start in a different tag/branch (i.e. `WASABI-1.1.0`)
  * You can change environment variables the nodes load by changing the `*.env` files variable from `envs`
