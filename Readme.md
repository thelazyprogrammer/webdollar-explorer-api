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

## Start REST API
```bash
cd server
npm install
npm run start
```

# REST API endpoints
```bash
# shows last 14 blocks
GET: /block

# shows block information
GET: /block/<block-id>

# shows miner information
GET: /miner/<miner_address>
```

## Start Explorer Dashboard
```bash
cd client
npm install
npm run dev
```
