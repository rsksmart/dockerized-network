#!/usr/bin/env bash
# we must use bash to support non POSIX env var names
mkdir logs
touch logs/rsk.log
echo "RSKJ_VERSION $1"
java -cp rskj-core-$1-all.jar co.rsk.Start &
tail -f logs/rsk.log
