#!/usr/bin/env bash
# we must use bash to support non POSIX env var names

echo "RSKJ_VERSION $1"
# use exec to replace PID 1 and receive signals
exec java -cp rskj-core-$1-all.jar co.rsk.Start
