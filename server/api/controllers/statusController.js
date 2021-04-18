const config = require('../../config')

// if the current block is older than MAX_SYNC_OFFSET seconds,
// then the explorer is unsynced
let MAX_SYNC_OFFSET = 600 * 1000

exports.get_status_mongo = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=40')

  var MongoClient = require('mongodb').MongoClient
  try {
    var mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  } catch (ex) {
    res.json()
    return
  }
  try {
    let blockChainDB = mongoDB.db(config.mongodb.db)
    let blockTask = await blockChainDB.collection(config.mongodb.collection).find({}).sort({ number: -1 }).limit(1).toArray()
    let blockNumberTask = await blockChainDB.collection(config.mongodb.collection).find({}).count()
    let trxTask = await blockChainDB.collection(config.mongodb.trx_collection).find({}).sort({ number: -1 }).count()
    let block = await blockTask
    let blockNumber = await blockNumberTask
    let trxCount = await trxTask
    let isSynchronized = false
    let currentTimestamp = new Date().getTime()
    if ((blockNumber - 1 === block[0].number || blockNumber === block[0].number) && currentTimestamp - block[0].timestamp * 1000 < MAX_SYNC_OFFSET) {
      isSynchronized = true
    }

    let statusResult = {
      is_synchronized: isSynchronized,
      current_timestamp: currentTimestamp,
      block_timestamp: block[0].timestamp * 1000,
      last_block: block[0].number,
      current_supply: getCurrentSupply(block[0].number),
      trx_number: trxCount,
      block_count: blockNumber,
    }
    res.json(statusResult)
  } catch (ex) {
    console.log(ex)
    res.json()
  } finally {
    mongoDB.close()
  }
}

function getCurrentSupply(blockNr) {
  let genesis_supply = 4156801128
  let blockNrStage1 = blockNr
  if (blockNr > 2158000) {
    blockNrStage1 = 2158000
  }
  let base_reward_supply = (blockNrStage1 - 40) * 6000

  let blockNrStage2 = 2158000
  if (blockNr > 2158000) {
    blockNrStage2 = blockNr
  }
  let after_base_reward_supply = (blockNrStage2 - 2158000) * 1500

  let final_supply = genesis_supply + base_reward_supply + after_base_reward_supply

  return final_supply
}

exports.get_current_supply = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=40')

  var MongoClient = require('mongodb').MongoClient
  try {
    var mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  } catch (ex) {
    res.json()
    return
  }
  try {
    let blockChainDB = mongoDB.db(config.mongodb.db)
    let block = await blockChainDB.collection(config.mongodb.collection).find({}).sort({ number: -1 }).limit(1).toArray()
    let current_supply = getCurrentSupply(block[0].number)
    res.json(current_supply)
  } catch (ex) {
    console.log(ex)
    res.json()
  } finally {
    mongoDB.close()
  }
}

exports.get_total_supply = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=3600')

  res.json(42000000000)
}
