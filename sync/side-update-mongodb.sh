#!/bin/bash
set -xe

FULL_BLOCKCHAIN_PATH=$1
BLOCKCHAIN_LOCAL_PATH="blockchainDB3"
BLOCKCHAIN_REMOTE_PATH="https://webdftp.vpnromania.ro/ftp/blockchainDB3.tar.gz"

rm -rf $BLOCKCHAIN_LOCAL_PATH
mkdir -p $BLOCKCHAIN_LOCAL_PATH

if [[ "${FULL_BLOCKCHAIN_PATH}" == '' ]]; then
  pushd $BLOCKCHAIN_LOCAL_PATH
    wget $BLOCKCHAIN_REMOTE_PATH
    tar -xzvf "${BLOCKCHAIN_LOCAL_PATH}.tar.gz"
  popd
else
  cp -r "${FULL_BLOCKCHAIN_PATH}" ./${BLOCKCHAIN_LOCAL_PATH}
fi

node pouchdb-mongodb-syncer.js 350000 500000
