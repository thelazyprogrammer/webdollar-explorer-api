//
// how to install mongodb
// https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04
//
// pouchdb does not need to be installed
// blockchainDB3 needs to be in the folder
//
// Example to sync blocks from 0 to 1000
//   # install mongodb
//   npm install
//   node pouchdb-mongodb-syncer.js 0 1000
//
// It syncs only the block information to the
// blocks collections in the MongoDB blockchainDB3 database
//
// To do:
//   1. If a block has transactions, compute involved_addresses and fee fields
//   2. Create transactions collection
const atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  winston = require('winston'),
  requestPromise = require('request-promise');

const MongoClient = require('mongodb').MongoClient;

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({ filename: __filename + '.log' })
  ]
});

const mongodbBlockchainDB = "blockchainDB3"
const mongodbBlockCollection = "blocks"
const mongodbTransactionCollection = "transactions"
const mongodbMTransactionCollection = "mtransactions"
const mongodbUrl = "mongodb://localhost:27017"

let miner = {
  address: '',
  pos_blocks: 0,
  ratio: 0,
  from: '',
  to: '',
  days: 0
}

async function getPoSMiners() {
  let posMiners = []
  let mongoDB = await MongoClient.connect(mongodbUrl, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(mongodbBlockchainDB);
  let toTimestamp = new Date()
  toTimestamp = toTimestamp.getTime() / 1000 - 60 * 60 * 0 
  let fromTimestamp = toTimestamp - 60 * 60 * 24 * 5
  let miners = await blockChainDB.collection(mongodbBlockCollection).aggregate([
    {
        '$match': {
          number: {
            '$gte': 567810
          },
          algorithm: 'pos',
          timestamp:  { $gte: fromTimestamp, $lte: toTimestamp }
        },
    },
    {
          '$group': {
            '_id': 0, 
            'resolvers': {
              '$addToSet': '$resolver'
            }
          }
    }
  ]).toArray()
  if (miners.length > 0) {
    miners = miners[0].resolvers
  }
  for (miner_index in miners) {
    let miner_balance_pos = await blockChainDB.collection(mongodbBlockCollection).aggregate([
      { $match: {
           resolver: miners[miner_index],
           algorithm: 'pos',
           reward: { $gt: 0 },
           number: { $gte: 567810 },
           timestamp:  { $gte: fromTimestamp, $lte: toTimestamp }
        }
      },
      { $group: {
          _id: 1,
          balance: {
             $sum: "$reward"
          }
        }
      }
     ]).toArray()
     if (miner_balance_pos.length == 1) {
     posMiners.push(
       {
         address: miners[miner_index],
         balance_pos: miner_balance_pos[0].balance / 10000
       }
     )}
  }
  return posMiners
}

async function checkSanity() {
  let knownAddresses = [
    'WEBD$gAY19Mp6VnujexNW3gjHNiAEQkvkIs9div$',
    'WEBD$gCsh0nNrsZv9VYQfe5Jn$9YMnD4hdyx62n$',
    'WEBD$gCMxAKX96yhmaygo@NG+vnb4cz1eYoYpMv$',
    'WEBD$gAosJ5+2tFnS$q5EsZZGVHKEU#cHnPJbZz$'
  ]

  let failure = false
  for (let i in knownAddresses) {
    let address = knownAddresses[i]
    let optionsExplorer = {
      uri:  'http://localhost:3000' + '/address/' + encodeURIComponent(address),
      json: true
    };
    var optionsCore = {
      uri:  'http://localhost:3333' + '/address/balance/' + encodeURIComponent(address),
      json: true
    };

    let balanceExplorer = await requestPromise(optionsExplorer)
    let balanceCoreWebdollar = await requestPromise(optionsCore)
    if (balanceExplorer.balance != balanceCoreWebdollar.balance) {
      failure = true
      console.log(address + ": balances are different. explorer " + balanceExplorer.balance + " != core " + balanceCoreWebdollar.balance)
    } else {
      console.log(address + ": balances are the same. explorer " + balanceExplorer.balance + " == core " + balanceCoreWebdollar.balance)
    }
  }
   if (failure) {
     throw "Addresses did not pass sanity check"
   }
}

async function executeCommand(command) {
  if (command == "get_pos_miners") {
    let miners = await getPoSMiners()
    miners = miners.sort((a,b) => b.balance_pos - a.balance_pos)
    let totalMined = 0
    miners.forEach(function (m) { totalMined+= m.balance_pos})
    console.log("pos miners: " + miners.length)
    console.log("pos resolved amount: " + totalMined)
    console.log("master resolver balance: " + 1888608034)
    console.log("master resolver resolved: " + miners[0].balance_pos)
    console.log("webd staked during the period: " + (totalMined * 1888608034 / miners[0].balance_pos))
    return
  } else if (command == "check_sanity") {
    await checkSanity()
  } else {
    throw ("Command not available: " + command)
  }
}

executeCommand(process.argv[2])
return
