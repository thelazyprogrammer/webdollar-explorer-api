#!/bin/bash
set -e

FROM=$1
TO=$2
STEP=100

for i in `seq ${FROM} ${TO}`; do
  from=$((($i - 1) * $STEP))
  to=$(($i * $STEP))
  output_full=$(node syncer.js $from $to)
  output_not_first_line=$(echo "${output_full}" | sed -n '1!p')
  output_first_line=$(echo "${output_full}" | sed -n '1p')
  echo "${output_first_line}"
  if [[ "${output_not_first_line}" != '' ]];then
    echo "Failed to sync"
    echo "${output_full}"
    exit 1
  fi
done
