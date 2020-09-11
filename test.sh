#!/usr/bin/env sh
set -ex

# disabled until we fix the environment to work with both tests
# sh migration-tests/test.sh
sh wasabi-opcodes/test.sh
sh migration-tests/test.sh
