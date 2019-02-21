#!/bin/bash

set -ex

BLOCKCHAIN_PATH=~/webdollar/Node-WebDollar/blockchainDB3
TIMEOUT=36000

function sync() {
    echo "Syncing..."
    rm -rf "blockchainDB3"
    cp -r $BLOCKCHAIN_PATH .
    node pouchdb-mongodb-syncer.js 609000 1000000 force
}

while true; do
    sync
    sleep $TIMEOUT
done

