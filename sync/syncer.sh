#!/bin/bash
set -e

FROM=$1
TO=$2
STEP=10

CURRENT_OFFSET=$FROM


function sync() {
FROM1=$1
TO1=$2


for i in `seq ${FROM1} ${TO1}`; do
  from=$((($i - 1) * $STEP))
  to=$(($i * $STEP))
  output_full=$(node syncer.js $from $to)
  output_not_first_line=$(echo "${output_full}" | sed -n '1!p')
  output_first_line=$(echo "${output_full}" | sed -n '1p')
  echo "${output_first_line}"
  if [[ "${output_not_first_line}" != '' ]];then
    echo "Failed to sync"
    echo "${output_full}"
    CURRENT_OFFSET=$i
    return
  fi
done
}

while true; do
  sync $CURRENT_OFFSET $TO
  sleep 100
done

