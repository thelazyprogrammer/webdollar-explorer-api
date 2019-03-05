'use strict';
var crypto = require('crypto'),
  request = require('request'),
  requestPromise = require('request-promise'),
  config = require('../../config'),
  blockchainUtils = require('../blockchain/utils');

const AMOUNT_DIVIDER = 10000
const REWARD = AMOUNT_DIVIDER * 6000
const ADDRESS_CACHE_DB = "address"
const BALANCE_RATIO_DECIMALS = 5
const MAX_POOLED_TRXS = 15
const MAX_BLOCKS = 25
const MAX_DEPTH = 1

const MAX_LATEST_BLOCKS = 15

const POS_FORK_BLOCK = 567810

function getEmptyAddress(miner_address) {
  return {
    'address': miner_address,
    'balance': 0,
    'total_supply_ratio': 0,
    'last_block': 0,
    'miner_balance': 0,
    'miner_balance_pow': 0,
    'miner_balance_pos': 0,
    'miner_balance_res': 0,
    'miner_fee_balance': 0,
    'miner_fee_to_balance': 0,
    'trx_to_balance': 0,
    'trx_from_balance': 0,
    'blocks': [],
    'transactions': [],
    'first_block_timestamp': 0,
    'last_block_timestamp': 0
  }
}

exports.latest_blocks_mongo = async function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cache-Control", "public, max-age=40")

  let pageNumber = Number.parseInt(req.query.page_number)
  let pageSize = Number.parseInt(req.query.page_size)
  if (isNaN(pageNumber) || !pageNumber) {
    pageNumber = 1
  }
  if (isNaN(pageSize) || !pageSize || pageSize > 25 || pageSize < 15) {
    pageSize = MAX_LATEST_BLOCKS
  }
  let miner = undefined
  let resolver = undefined
  if (req.query.miner) {
    miner = req.query.miner
  }
  if (req.query.resolver) {
    resolver = req.query.resolver
  }

  let blocks = []
  let MongoClient = require('mongodb').MongoClient;
  try {
    var mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  } catch (ex) {
    console.log(ex)
    res.json()
    return
  }
  try {
    let blockChainDB = mongoDB.db(config.mongodb.db);
    let findQuery = {}
    if (miner) {
      findQuery.miner = miner
    }
    if (resolver) {
      findQuery.resolver = resolver
      findQuery.miner = { $ne: resolver }
    }
    let blockNumberTask = blockChainDB.collection(config.mongodb.collection).find(findQuery).count()

    let blocksTask = blockChainDB.collection(config.mongodb.collection).find(findQuery).sort( { number: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()

    let blocks = await blocksTask
    let blockNumber = await blockNumberTask
    let pages = Math.round(blockNumber / pageSize)
    res.json({
        result: true,
        blocks: blocks,
        page_number: pageNumber,
        pages: pages,
        blocks_number: blockNumber
    })
    return
  } catch (ex) {
    console.log(ex)
    res.json()
    return
  } finally {
    mongoDB.close()
  }
}

exports.read_a_block_mongo = async function(req, res) {
  res.header("Cache-Control", "public, max-age=40")
  res.header("Access-Control-Allow-Origin", "*");

  var blockNumber = parseInt(req.params.blockId)
  var block = {}
  try {
    let MongoClient = require('mongodb').MongoClient;
    let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
    let blockChainDB = mongoDB.db(config.mongodb.db);

    let block_db = await blockChainDB.collection(config.mongodb.collection).find({ number: blockNumber }).toArray()
    if (block_db.length == 1) {
      block = block_db[0]
      let trxs = await blockChainDB.collection(config.mongodb.trx_collection).find({ block_number: blockNumber }).toArray()
      block.trxs = trxs
    } else {
      console.log(block_db)
    }
    mongoDB.close()
    res.json(block)
    return
  } catch (ex) {
    console.log(ex)
    res.json(block)
    return
  }
  res.json(block)
}

exports.read_an_address_mongo = async function (req, res) {
  res.header("Cache-Control", "public, max-age=40")
  res.header("Access-Control-Allow-Origin", "*");

  var miner_address = req.params.address
  let start = new Date(1524743407 * 1000).getTime() / 1000
  let end = new Date().getTime() / 1000
  if (req.query.start_date && req.query.end_date) {
    start = new Date(req.query.start_date).getTime() / 1000
    end = new Date(req.query.end_date).getTime() / 1000
  }
  var miner = getEmptyAddress(miner_address)

  if (miner_address.length != 40) {
    console.log("Address " + miner_address + " is not 40 char long")
    res.json(miner);
    return
  }
  console.log("getting miner " + miner_address)
  miner.balance = 0
  miner.miner_balance = 0
  miner.trx_to_balance = 0
  miner.trx_from_balance = 0
  miner.blocks = []
  miner.transactions = []
  miner.pooled_trxs = []
  miner.transactions_number = 0
  miner.blocks_number = 0
  try {
    let MongoClient = require('mongodb').MongoClient;
    let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
    let blockChainDB = mongoDB.db(config.mongodb.db);
    let miner_balance_task = blockChainDB.collection(config.mongodb.collection).aggregate([
      { $match: {
           miner: miner.address,
           timestamp: { $gte: start, $lte: end},
           reward: { $gt: 0 }
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
    let miner_balance_pos_task = blockChainDB.collection(config.mongodb.collection).aggregate([
      { $match: {
           miner: miner.address,
           timestamp: { $gte: start, $lte: end},
           algorithm: 'pos',
           reward: { $gt: 0 }
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

    let miner_balance_res_task = blockChainDB.collection(config.mongodb.collection).aggregate([
      { $match: {
           resolver: miner.address,
           timestamp: { $gte: start, $lte: end},
           miner: { $ne: miner.address },
           algorithm: 'pos',
           reward: { $gt: 0 }
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

    let miner_blocks_resolved_number_task = await blockChainDB.collection(config.mongodb.collection).find({
        timestamp: { $gte: start, $lte: end},
        resolver: miner.address, miner: {$ne: miner.address}}).count()

    // get min/max block number between dates
    let max_block_number_array = await blockChainDB.collection(config.mongodb.trx_collection).find({
        addresses: {$all: [miner.address]},
        timestamp: { $gte: start, $lte: end},
      }
    ).sort( { block_number: -1 }).limit(1).toArray()
    let min_block_number_array = await blockChainDB.collection(config.mongodb.trx_collection).find({
        addresses: {$all: [miner.address]},
        timestamp: { $gte: start, $lte: end},
      }
    ).sort( { block_number: 1 }).limit(1).toArray()
    let min_block_number = 0
    let max_block_number = 0
    if (min_block_number_array && min_block_number_array.length == 1) {
      min_block_number = min_block_number_array[0].block_number
    }
    if (max_block_number_array && max_block_number_array.length == 1) {
      max_block_number = max_block_number_array[0].block_number
    }

    // get general min/max block timestamps
    let gen_max_block_number_array = await blockChainDB.collection(config.mongodb.collection).find({
        addresses: {$all: [miner.address]}
      }
    ).sort( { number: -1 }).limit(1).toArray()
    let gen_min_block_number_array = await blockChainDB.collection(config.mongodb.collection).find({
        addresses: {$all: [miner.address]},
      }
    ).sort( { number: 1 }).limit(1).toArray()

    let trx_to_balance_task = blockChainDB.collection(config.mongodb.mtrx_collection).aggregate([
      { $match: {
           address: miner.address,
           block_number: { $gte: min_block_number, $lte: max_block_number },
           type: 0,
           amount: { $gt: 0 }
        }
      },
      { $group: {
          _id: 1,
          balance: {
             $sum: "$amount"
          }
        }
      }
    ]).toArray()

    let trx_from_balance_task = blockChainDB.collection(config.mongodb.mtrx_collection).aggregate([
      { $match: {
           address: miner.address,
           block_number: { $gte: min_block_number, $lte: max_block_number },
           amount: { $gt: 0 },
           type: 1
        }
      },
      { $group: {
          _id: 1,
          balance: {
             $sum: "$amount"
          }
        }
      }
    ]).toArray()

    let last_block_task = blockChainDB.collection(config.mongodb.collection).find({
      timestamp: { $gte: start, $lte: end},
    }).sort( { number: -1 }).limit(1).toArray()

    // WAIT FOR TASKS
    let miner_balance = await miner_balance_task
    let miner_balance_pos = await miner_balance_pos_task
    let miner_balance_res = await miner_balance_res_task
    let last_block = await last_block_task
    let trx_from_balance = await trx_from_balance_task
    let trx_to_balance = await trx_to_balance_task

    // DO STUFF AFTER TASKS ARE FINISHED
    if (gen_min_block_number_array && gen_min_block_number_array.length == 1) {
      miner.first_block_timestamp = gen_min_block_number_array[0].timestamp
    }
    if (gen_max_block_number_array && gen_max_block_number_array.length == 1) {
      miner.last_block_timestamp = gen_max_block_number_array[0].timestamp
    }

    if (last_block && last_block.length > 0) {
      miner.last_block = last_block[0].number
    } else {
      miner.last_block = 0
    }
    let totalSupply = blockchainUtils.getTotalSupply(miner.last_block)

    if (miner_balance_res.length == 1) {
      miner.miner_balance_res = miner_balance_res[0].balance / 10000
    }
    if (miner_balance.length == 1) {
      miner.miner_balance = miner_balance[0].balance
      if (miner_balance_pos.length == 1) {
          miner.miner_balance_pos = miner_balance_pos[0].balance
      }
      miner.miner_balance_pow = (miner.miner_balance - miner.miner_balance_pos) / 10000
      miner.miner_balance_pos = miner.miner_balance_pos / 10000
    }
    if (trx_to_balance.length == 1) {
      miner.trx_to_balance = trx_to_balance[0].balance
    }
    if (trx_from_balance.length == 1) {
      miner.trx_from_balance = trx_from_balance[0].balance
    }
    miner.balance = (miner.miner_balance - miner.trx_to_balance + miner.trx_from_balance) /10000
    miner.total_supply_ratio = (miner.balance / totalSupply * 100).toFixed(BALANCE_RATIO_DECIMALS)
    miner.miner_balance = miner.miner_balance / 10000
    miner.trx_to_balance = miner.trx_to_balance / 10000
    miner.trx_from_balance = miner.trx_from_balance / 10000

    mongoDB.close()
  } catch (ex) {
    console.log(ex)
  }
  res.json(miner)
  return
}

exports.get_latest_trx = async function (req, res) {
  res.header("Cache-Control", "public, max-age=1")
  res.header("Access-Control-Allow-Origin", "*");

  let maxTransactions = 10
  let toTimestamp = new Date()
  toTimestamp = toTimestamp.getTime() / 1000 - 60 * 60 * 0
  let fromTimestamp = toTimestamp - 60 * 60 * 24

  let MongoClient = require('mongodb').MongoClient;
  let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(config.mongodb.db);

  let latest_trxs = await blockChainDB.collection(config.mongodb.trx_collection).aggregate([
    {
      $match: {
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp},
      }
    },
    {
      $sort: {
        from_amount: -1
      }
    },
    {
      $limit: maxTransactions
    }
  ]).toArray()

  if (!latest_trxs) {
    latest_trx  = []
  }
  res.json({
    trxs: latest_trxs,
    trxs_number: latest_trxs.length
  })
  return
}


exports.get_latest_miners = async function (req, res) {
  res.header("Cache-Control", "public, max-age=1")
  res.header("Access-Control-Allow-Origin", "*");

  let maxMiners = 10
  let toTimestamp = new Date()
  toTimestamp = toTimestamp.getTime() / 1000 - 60 * 60 * 0
  let fromTimestamp = toTimestamp - 60 * 60 * 24

  let MongoClient = require('mongodb').MongoClient;
  let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(config.mongodb.db);

  let miners = await blockChainDB.collection(config.mongodb.collection).aggregate([
    {
        '$match': {
          number: {
            '$gte': POS_FORK_BLOCK
          },
          timestamp:  { $gte: fromTimestamp, $lte: toTimestamp }
        },
    },
    {
          '$group': {
            '_id': '$miner',
            'blocks': {
              '$sum': 1
            },
            'reward': {
              '$sum': '$reward'
            }
          }
    },
    {
      $sort: {
        reward: -1,
        blocks: -1
      }
    },
    {
      $limit: maxMiners
    }
  ]).toArray()
  let pow_miners_query = [
    {
        '$match': {
          number: {
            '$gte': POS_FORK_BLOCK
          },
          timestamp:  { $gte: fromTimestamp, $lte: toTimestamp },
          algorithm:  'pow'
        },
    },
    {
          '$group': {
            '_id': '$miner',
            'blocks': {
              '$sum': 1
            },
          }
    },
  ]

  let latest_miners = []
  if (miners.length > 0) {
    let addresses = miners.map(a => a._id)
    pow_miners_query[0]['$match']['miner'] = {
      '$in': addresses
    }
    let pow_miners = await blockChainDB.collection(config.mongodb.collection).aggregate(pow_miners_query).toArray()
    latest_miners = miners
    let total_amount = 6000 * 60 * 60 * 24 / 45 * 10000
    miners.forEach(function(m) {
        m.ratio = Math.round(m.reward / total_amount * 100 * 100) / 100
        m.pow_blocks = 0
        if (pow_miners && pow_miners.length > 0) {
          pow_miners.forEach(function (posMiner){
            if (posMiner._id == m._id) {
              m.pow_blocks = posMiner.blocks
              return
            }
          })
        }
        m.pos_blocks = m.blocks - m.pow_blocks
    })
  }
  res.json({
    miners: latest_miners,
    miners_number: latest_miners.length
  })
  return
}


exports.get_trx = async function (req, res) {
  res.header("Cache-Control", "public, max-age=1")
  res.header("Access-Control-Allow-Origin", "*");

  let maxTransactions = 15
  let miner = ''

  if (req.query.miner) {
    miner = req.query.miner
  } else {
    res.json({})
    return
  }
  let pageNumber = Number.parseInt(req.query.page_number)
  let pageSize = Number.parseInt(req.query.page_size)
  if (isNaN(pageNumber) || !pageNumber) {
    pageNumber = 1
  }
  if (isNaN(pageSize) || !pageSize || pageSize > 25 || pageSize < 15) {
    pageSize = 15
  }


  let MongoClient = require('mongodb').MongoClient;
  let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(config.mongodb.db);
  let trxsTask = blockChainDB.collection(config.mongodb.trx_collection).find({
            addresses: {$all: [miner]},
          }
    ).sort( { block_number: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()
  let trxsNumberTask = blockChainDB.collection(config.mongodb.trx_collection).find({
            addresses: {$all: [miner]},
          }
    ).count()

  let trxs = await trxsTask
  let trxsNumber = await trxsNumberTask
  let pages = Math.round(trxsNumber / pageSize)

  res.json({
    trxs: trxs,
    trxs_number: trxsNumber,
    page_number: pageNumber,
    pages: pages
  })
  return
}

