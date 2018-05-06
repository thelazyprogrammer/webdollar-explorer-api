#!/bin/bash

BLOCK_START=0
BLOCK_END=2000

echo '['

for((block=$BLOCK_START;block<$BLOCK_END;block++))
do
    output=$(curl -sb -H "Accept: application/json" "http://localhost:3000/block/$block")
    out=$(echo ${output} | jq '.' | grep 'trxs' | grep -v '"trxs": \[\]')
    if [ $? -eq 0 ]; then
        echo ${output} | jq '.'
        echo ","
    fi
    
done
echo "]"

