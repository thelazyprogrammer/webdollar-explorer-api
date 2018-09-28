const config = require('../../config');

// if the current block is older than MAX_SYNC_OFFSET seconds,
// then the explorer is unsynced
let MAX_SYNC_OFFSET = 600 * 1000


exports.get_status_mongo = async function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  try {
    MongoClient = require('mongodb').MongoClient;
    let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
    let blockChainDB = mongoDB.db(config.mongodb.db);

    let block = await blockChainDB.collection(config.mongodb.collection).find({}).sort( { number: -1 } ).limit(1).toArray()
    let isSynchronized = false
    let currentTimestamp = new Date().getTime()
    if (currentTimestamp - block[0].timestamp * 1000 < MAX_SYNC_OFFSET) {
      isSynchronized = true
    }

    let statusResult = {
      is_synchronized : isSynchronized,
      current_timestamp : currentTimestamp,
      block_timestamp : block[0].timestamp * 1000,
      last_block : block[0].number
    }
    res.json(statusResult)
  } catch (ex) {
    res.json()
  }
}


exports.get_status = function(req, res) {
  const blockchain = require('../blockchain/blockchain');
  const request = require('request')
  let lastBlockInfo = blockchain.getSyncInfo(function (block) {
    res.header("Access-Control-Allow-Origin", "*");
    if (!block) {
      res.json({})
      return
    }
    let is_synchronized = false
    let currentTimestamp = new Date().getTime()
    let date = new Date((block.raw_timestamp + 1524742312) * 1000)
    let blockTimestamp = date.getTime()
    if (currentTimestamp - blockTimestamp < MAX_SYNC_OFFSET) {
      is_synchronized = true
    }
    let statusResult = {
      is_synchronized : is_synchronized,
      current_timestamp : currentTimestamp,
      block_timestamp : blockTimestamp,
      last_block : block.id
    }
    res.json(statusResult)
  });
}
