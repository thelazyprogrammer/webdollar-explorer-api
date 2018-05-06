#!/bin/bash

BLOCK_START=0
BLOCK_END=205601

for((block=$BLOCK_START;block<$BLOCK_END;block++))
do
    output=$(curl -sb -H "Accept: application/json" "http://localhost:3000/block/$block")
    echo ${output} | jq '.' | grep 'trxs' | grep -v '"trxs": \[\]'
    if [ $? -eq 0 ]; then
        printf "\n\n<<< Getting block number $block \n"
        echo ${output} | jq '.'
    fi
    
done


