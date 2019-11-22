#!/usr/bin/env bash
# we must use bash to support non POSIX env var names
mkdir logs
touch logs/rsk.log
echo "RSKJ_BRANCH" "$BRANCH" "$JARFILE" > branch

java -cp "$JARFILE" co.rsk.Start &
tail -f logs/rsk.log
