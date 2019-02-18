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

const MAX_LATEST_BLOCKS = 14

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
    'transactions': []
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
    let blockNumber = await blockChainDB.collection(config.mongodb.collection).find({}).count()
    let pages = Math.round(blockNumber / pageSize)

    blocks = await blockChainDB.collection(config.mongodb.collection).find({}).sort( { number: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()
    res.json({
        result: true,
        blocks: blocks,
        page_number: pageNumber,
        pages: pages
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

exports.latest_blocks = function(req, res) {
  var blocks = [];
  var max_block_length;

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cache-Control", "public, max-age=10")

  request.get(config.webdollar.pouchdb_sync_url + '/blocks/' + MAX_LATEST_BLOCKS, function (error, response, body) {
    if (error) {
      console.error(error)
      console.error(body)
    } else {
      try {
        var raw_blocks = JSON.parse(body).blocks
        raw_blocks.forEach(function(block) {
          block.reward = block.reward
          block.number = block.id
          block.timestamp = parseInt(block.raw_timestamp) + 1524742312
          block.miner = blockchainUtils.decodeMinerAddress(block.miner_address)
          blocks.push(block)
        })
      } catch(ex) {
        console.error(body)
        console.error(ex.message)
      }
    }

    blocks = blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))
    res.json(blocks)
    return
  });
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

exports.read_a_block = function(req, res) {
  var blockId = parseInt(req.params.blockId);
  var block = {}

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Cache-Control", "public, max-age=40")

  request.get(config.webdollar.pouchdb_sync_url + '/block/' + blockId, function (error, response, body) {
    if (error) {
      console.error(error)
      console.error(body)
    } else {
      try {
        block = JSON.parse(body).block
        block.reward = block.reward / AMOUNT_DIVIDER
        block.miner_address = blockchainUtils.decodeMinerAddress(block.miner_address)
        block.miner = blockchainUtils.decodeMinerAddress(block.miner_address)
        var date = new Date((block.raw_timestamp + 1524742312) * 1000)
        block.timestamp = date.toUTCString()
        var transactions_parsed = []

        block.trxs.forEach(function(transaction) {
          var transaction_parsed = transaction
          transaction_parsed.block_number = block.id
          transaction_parsed.timestamp = date.getTime() / 1000
          transaction_parsed.fee = 0
          var to_amount = 0

          transaction_parsed.from.address = []
          transaction_parsed.from.amount = 0

          transaction_parsed.from.addresses.forEach(function(from) {
            transaction_parsed.from.address.push(from.address)
            transaction_parsed.from.amount += parseInt(from.amount)
          })

          transaction_parsed.to.address = []
          transaction_parsed.to.addresses.forEach(function(to) {
            transaction_parsed.to.address.push(to.address)
            to_amount += parseInt(to.amount)
          })

          transaction_parsed.fee = transaction_parsed.from.amount - to_amount

          transactions_parsed.push(transaction_parsed)
        })

        block.trxs = transactions_parsed
        block.transactions_number = block.trxs.length
      } catch(ex) {
        console.error(body)
        console.error(ex.message)
      }
    }
    res.json(block)
    return
  });
}

exports.read_an_address_mongo = async function (req, res) {
  res.header("Cache-Control", "public, max-age=40")
  res.header("Access-Control-Allow-Origin", "*");

  var miner_address = req.params.address
  var show_all_transactions = false
  let start = new Date(1524743407 * 1000).getTime() / 1000
  let end = new Date().getTime() / 1000
  if (req.query.show_all_transactions) {
    if (req.query.show_all_transactions == 'true' || req.query.show_all_transactions === true) {
      show_all_transactions = true
      console.log('Showing all trxs for address:' + miner_address)
    }
  }
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
    let miner_balance = await blockChainDB.collection(config.mongodb.collection).aggregate([
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
    let miner_balance_pos = await blockChainDB.collection(config.mongodb.collection).aggregate([
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

    let miner_balance_res = await blockChainDB.collection(config.mongodb.collection).aggregate([
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
    miner.blocks_number = await blockChainDB.collection(config.mongodb.collection).find({
        timestamp: { $gte: start, $lte: end},
        miner: miner.address}).count()
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
    let max_block_number = 100000000
    if (min_block_number_array && min_block_number_array.length == 1) {
      min_block_number = min_block_number_array[0].block_number
    }
    if (max_block_number_array && max_block_number_array.length == 1) {
      max_block_number = max_block_number_array[0].block_number
    }
    let trx_to_balance = await blockChainDB.collection(config.mongodb.mtrx_collection).aggregate([
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

    let trx_from_balance = await blockChainDB.collection(config.mongodb.mtrx_collection).aggregate([
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
    miner.miner_balance = miner.miner_balance / 10000
    miner.trx_to_balance = miner.trx_to_balance / 10000
    miner.trx_from_balance = miner.trx_from_balance / 10000

    let last_block = await blockChainDB.collection(config.mongodb.collection).find({
      timestamp: { $gte: start, $lte: end},
    }).sort( { number: -1 }).limit(1).toArray()
    miner.last_block= last_block[0].number
    let totalSupply = blockchainUtils.getTotalSupply(miner.last_block)
    miner.total_supply_ratio = (miner.balance / totalSupply * 100).toFixed(BALANCE_RATIO_DECIMALS)

    miner.blocks = await blockChainDB.collection(config.mongodb.collection).find(
        {
            miner: miner.address,
            timestamp: { $gte: start, $lte: end},
        }
    ).sort( { number: -1 }).limit(MAX_BLOCKS).toArray()
    let max_transactions = await blockChainDB.collection(config.mongodb.trx_collection).find({
        addresses: {$all: [miner.address]},
        timestamp: { $gte: start, $lte: end},
      }
    ).sort( { block_number: -1 }).limit(100).toArray()
    miner.transactions = []
    let pooled_transactions = 0
    for (let i=0; i<max_transactions.length; i++) {
      let trx = max_transactions[i]
      if (trx.addresses.length > 10) {
        pooled_transactions += 1
      }
      if (pooled_transactions <= MAX_POOLED_TRXS) {
        miner.transactions.push(trx)
      } else {
        break
      }
    }
    miner.transactions_number = await blockChainDB.collection(config.mongodb.trx_collection).find({
        timestamp: { $gte: start, $lte: end},
        addresses: {$all: [miner.address]}}).count()
    mongoDB.close()
  } catch (ex) {
    console.log(ex)
  }
  res.json(miner)
  return
}

exports.read_an_address = function (req, res) {
  res.header("Cache-Control", "public, max-age=40")
  res.header("Access-Control-Allow-Origin", "*");

  var miner_address = req.params.address
  var show_all_transactions = false
  if (req.query.show_all_transactions) {
    if (req.query.show_all_transactions == 'true' || req.query.show_all_transactions === true) {
      show_all_transactions = true
      console.log('Showing all trxs for address:' + miner_address)
    }
  }
  var miner = getEmptyAddress(miner_address)

  if (miner_address.length != 40) {
    console.log("Address " + miner_address + " is not 40 char long")
    res.json(miner);
    return
  }
  request.get(config.webdollar.pouchdb_sync_url + '/address/' + encodeURIComponent(miner_address), function (error, response, body) {
    if (error) {
      console.error(error)
      res.json(miner)
      return
    }
    try {
      var miner_received = JSON.parse(body)
      miner.balance = miner_received.balance
      miner.last_block = miner_received.last_block
      if (miner.last_block) {
        var totalSupply = blockchainUtils.getTotalSupply(miner.last_block)
        miner.total_supply_ratio = (miner.balance / totalSupply * 100).toFixed(BALANCE_RATIO_DECIMALS)
      }

      var blocks_parsed = []
      miner_received.minedBlocks.forEach(function(block) {
        var block_parsed = block
        block_parsed.block_id = block_parsed.blockId
        block_parsed.number = block_parsed.blockId
        block_parsed.id = block_parsed.blockId
        block_parsed.timestamp = block_parsed.timestamp + 1524742312
        block_parsed.trxs_number = block_parsed.transactions.length

        blocks_parsed.push(block_parsed)
      })
      miner.blocks = blocks_parsed
      miner.blocks = miner.blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))

      var transactions_parsed = []
      miner.trx_to_balance = 0
      miner.trx_from_balance = 0

      miner_received.transactions =  miner_received.transactions.sort((a, b) => Number(b.blockId) - Number(a.blockId))
      miner.pooled_trxs = 0
      miner_received.transactions.forEach(function(transaction) {
        var transaction_parsed = transaction
        transaction_parsed.block_number = transaction.blockId
        transaction_parsed.id = transaction.blockId
        var date = new Date((transaction.timestamp + 1524742312) * 1000)
        transaction_parsed.timestamp = date.getTime() / 1000
        transaction_parsed.fee = 0
        var to_amount = 0

        transaction_parsed.from = {
          amount: 0,
          address: []
        }
        if (transaction_parsed.transaction.from.addresses.length > 1 || transaction_parsed.transaction.to.addresses.length > 1) {
          miner.pooled_trxs += 1
        }
        transaction_parsed.transaction.from.addresses.forEach(function(from) {
          transaction_parsed.from.address.push(from.address)
          transaction_parsed.from.amount += parseInt(from.amount)
          if (miner.address == from.address) {
            miner.trx_to_balance += parseInt(from.amount)
          }
        })

        transaction_parsed.to = {
          address: []
        }
        transaction_parsed.transaction.to.addresses.forEach(function(to) {
          transaction_parsed.to.address.push(to.address)
          to_amount += parseInt(to.amount)
          if (miner.address == to.address) {
            miner.trx_from_balance += parseInt(to.amount)
          }
        })

        transaction_parsed.fee = transaction_parsed.from.amount - to_amount
        transaction_parsed.from.addresses = transaction_parsed.transaction.from.addresses
        transaction_parsed.to.addresses = transaction_parsed.transaction.to.addresses
        transactions_parsed.push(transaction_parsed)
      })
      miner.transactions = transactions_parsed
      miner.transactions_number = miner.transactions.length
      miner.blocks_number = miner.blocks.length
      if (!show_all_transactions && miner.pooled_trxs > MAX_POOLED_TRXS) {
         miner.transactions = miner.transactions.slice(0,MAX_POOLED_TRXS)
      }
      if (!show_all_transactions && miner.blocks.length > MAX_BLOCKS) {
          miner.blocks = miner.blocks.slice(0,MAX_BLOCKS)
      }
      miner.miner_balance = (miner.balance * AMOUNT_DIVIDER + miner.trx_to_balance - miner.trx_from_balance) / AMOUNT_DIVIDER
      miner.trx_to_balance = miner.trx_to_balance / AMOUNT_DIVIDER
      miner.trx_from_balance = miner.trx_from_balance / AMOUNT_DIVIDER

      res.json(miner)
      return
    } catch (exception) {
      console.log(exception.message)
      res.json(miner)
      return
    }
  })
}

async function getStars(address, depth, addresses, stars, first) {

  let first_depth = depth * 13
  if (first || depth == MAX_DEPTH + 1) {
    first_depth = 1001
  }
  if (!addresses.includes(address)) {
    addresses.push(address)
    stars.nodes.push({
      id: address,
      group: first_depth
    })
  }

  var options = {
    uri: config.webdollar.pouchdb_sync_url + '/address/' + encodeURIComponent(address),
    json: true
  };

  let address_info = await requestPromise(options)
    try {
      let current_addresses = []
      address_info.transactions.forEach(function(transaction) {
        let is_from = false
        let is_to = false
        let from_addresses = []
        let to_addresses = []
        transaction.transaction.from.addresses.forEach(function(from) {
          if (!addresses.includes(from.address)) {
            from_addresses.push(from.address)
          }
          if (from.address == address) {
            is_from = true
          }
        })
        transaction.transaction.to.addresses.forEach(function(to) {
          if (!addresses.includes(to.address)) {
            to_addresses.push(to.address)
          }
          if (to.address == address) {
            is_to = true
          }
        })
        if (is_from) {
          current_addresses = current_addresses.concat(to_addresses)
        }
        if (is_to) {
          current_addresses = current_addresses.concat(from_addresses)
        }
      })

      current_addresses.forEach(function(curr_address) {
        if (!addresses.includes(curr_address)) {
          console.log("Found star: " + curr_address)
          addresses.push(curr_address)
          stars.nodes.push({
            id: curr_address,
            group: (depth + 1) * 13
          });
          stars.links.push({
            source: address,
            target: curr_address,
            value: 1
          });
        }
      })
      if (depth == 1) {
        return Promise.resolve(stars)
      } else {
        let stars1 = []
        current_addresses.forEach(function(curr_address) {
          stars1 = Promise.resolve(getStars(curr_address, depth - 1, addresses, stars))
        })
        return Promise.resolve(stars1)
      }
    } catch (exception) {
      console.log(exception.message)
      return stars
    }
}

exports.get_stars = async function (req, res) {
  res.header("Cache-Control", "public, max-age=1000")
  res.header("Access-Control-Allow-Origin", "*");

  let address = req.params.address;
  let depth = 1;
  if (req.query.depth) {
    depth = parseInt(req.query.depth);
  }

  if (address.length != 40 || depth > MAX_DEPTH + 1) {
    res.json(false);
    return
  }
  console.log("Getting stars for address: " + address + ", depth: " + depth)
  let stars = await getStars(address, depth, [], { nodes: [], links: []}, true)
  res.json(stars);
  return;
}

exports.get_pending_trx = async function (req, res) {
  res.header("Cache-Control", "public, max-age=1")
  res.header("Access-Control-Allow-Origin", "*");

  request.get(config.webdollar.pouchdb_sync_url + '/transactions/pending', function (error, response, body) {
    if (error) {
      console.error(error)
      res.json({
        trxs: [],
        trxs_number: 0
      })
      return
    }
    let transactions = []
    let pending_transactions = []
    try {
      pending_transactions = JSON.parse(body)
    } catch (ex) {}
    pending_transactions.forEach(function(transaction) {
      try {
        let transaction_parsed = {
          fee: 0,
          from: {
            amount: 0,
            address: [],
            addresses: transaction.from.addresses
          },
          to: {
            address: [],
            addresses: transaction.to.addresses
          }
        }
        var to_amount = 0

        transaction.from.addresses.forEach(function(from) {
          transaction_parsed.from.address.push(from.address)
          transaction_parsed.from.amount += parseInt(from.amount)
        })

        transaction.to.addresses.forEach(function(to) {
          transaction_parsed.to.address.push(to.address)
          to_amount += parseInt(to.amount)
        })

        transaction_parsed.fee = transaction_parsed.from.amount - to_amount

        transactions.push(transaction_parsed)
    } catch (ex) {
      console.log(ex)
    }

    })
    res.json({
      trxs: transactions,
      trxs_number: transactions.length
    })
    return
  })
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
    let total_amount = 6000 * 60 * 60 * 24 / 40 * 10000
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
