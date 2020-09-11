#!/usr/bin/env bash
set -e

wait_for_rskj() {
  echo Connecting to RSKj
  for i in `seq 1 30`;
  do
    nc -z "$1" 4444 && return 0
    sleep 0.5
  done
  echo Failed to connect to RSKj
  exit 1
}

RSKJ_HOSTNAME=$1
shift

wait_for_rskj "$RSKJ_HOSTNAME"
exec "$@"
