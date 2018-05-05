# Prepare environemnt

## Install ubuntu 16.04

## Install webdollar miner

## Install couchdb
```bash
curl -L https://couchdb.apache.org/repo/bintray-pubkey.asc | sudo apt-key add -
echo "deb https://apache.bintray.com/couchdb-deb xenial main" | sudo tee -a /etc/apt/sources.list
sudo apt update
sudo apt-get install couchdb -y
```

## Configure webdollar miner to use couchdb
```bash
COUCHDB_URL="http:\/\/admin:password@localhost:5984\/blockchaindb"
sed -i -e "s/blockchainDB3/${COUCHDB_URL}/g" "src/consts/const_global.js"
npm install
```

## Start webdollar miner
```bash
npm run commands
# press 8
```

# Create a REST API to show every block information
GET: /block
GET: /block/<block-id>
