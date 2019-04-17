'use strict'
var crypto = require('crypto')
var request = require('request')
var requestPromise = require('request-promise')
var config = require('../../config')
var blockchainUtils = require('../blockchain/utils')

const AMOUNT_DIVIDER = 10000
const REWARD = AMOUNT_DIVIDER * 6000
const ADDRESS_CACHE_DB = 'address'
const BALANCE_RATIO_DECIMALS = 5
const MAX_POOLED_TRXS = 15
const MAX_BLOCKS = 25
const MAX_DEPTH = 1

const MAX_LATEST_BLOCKS = 15

const POS_FORK_BLOCK = 567810

function getEmptyAddress (miner_address) {
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

exports.latest_blocks_mongo = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=40')

  let pageNumber = Number.parseInt(req.query.page_number)
  let pageSize = Number.parseInt(req.query.page_size)
  if (isNaN(pageNumber) || !pageNumber) {
    pageNumber = 1
  }
  if (isNaN(pageSize) || !pageSize || pageSize > 25 || pageSize < 15) {
    pageSize = MAX_LATEST_BLOCKS
  }
  let miner
  let resolver
  if (req.query.miner) {
    miner = req.query.miner
  }
  if (req.query.resolver) {
    resolver = req.query.resolver
  }

  let blocks = []
  let MongoClient = require('mongodb').MongoClient
  try {
    var mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  } catch (ex) {
    console.log(ex)
    res.json()
    return
  }
  try {
    let blockChainDB = mongoDB.db(config.mongodb.db)
    let findQuery = {}
    if (miner) {
      findQuery.miner = miner
    }
    if (resolver) {
      findQuery.resolver = resolver
      findQuery.miner = { $ne: resolver }
    }
    let blockNumberTask = blockChainDB.collection(config.mongodb.collection).find(findQuery).count()

    let blocksTask = blockChainDB.collection(config.mongodb.collection).find(findQuery).sort({ number: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()

    let blocks = await blocksTask
    let blockNumber = await blockNumberTask
    let pages = Math.ceil(blockNumber / pageSize)
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

exports.read_a_block_mongo = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=120')

  var blockNumber = parseInt(req.params.blockId)
  var block = {}
  try {
    let MongoClient = require('mongodb').MongoClient
    let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
    let blockChainDB = mongoDB.db(config.mongodb.db)

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
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=40')

  var miner_address = req.params.address
  let start = new Date(1524743407 * 1000).getTime() / 1000
  let end = new Date().getTime() / 1000
  if (req.query.start_date && req.query.end_date) {
    start = new Date(req.query.start_date).getTime() / 1000
    end = new Date(req.query.end_date).getTime() / 1000
  }
  var miner = getEmptyAddress(miner_address)

  if (miner_address.length != 40) {
    console.log('Address ' + miner_address + ' is not 40 char long')
    res.json(miner)
    return
  }
  console.log('getting miner ' + miner_address)
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
    let MongoClient = require('mongodb').MongoClient
    let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
    let blockChainDB = mongoDB.db(config.mongodb.db)
    let miner_balance_task = blockChainDB.collection(config.mongodb.collection).aggregate([
      { $match: {
        miner: miner.address,
        timestamp: { $gte: start, $lte: end },
        reward: { $gt: 0 }
      }
      },
      { $group: {
        _id: 1,
        balance: {
          $sum: '$reward'
        }
      }
      }
    ]).toArray()
    let miner_balance_pos_task = blockChainDB.collection(config.mongodb.collection).aggregate([
      { $match: {
        miner: miner.address,
        timestamp: { $gte: start, $lte: end },
        algorithm: 'pos',
        reward: { $gt: 0 }
      }
      },
      { $group: {
        _id: 1,
        balance: {
          $sum: '$reward'
        }
      }
      }
    ]).toArray()

    let miner_balance_res_task = blockChainDB.collection(config.mongodb.collection).aggregate([
      { $match: {
        resolver: miner.address,
        timestamp: { $gte: start, $lte: end },
        miner: { $ne: miner.address },
        algorithm: 'pos',
        reward: { $gt: 0 }
      }
      },
      { $group: {
        _id: 1,
        balance: {
          $sum: '$reward'
        }
      }
      }
    ]).toArray()

    let miner_blocks_resolved_number_task = await blockChainDB.collection(config.mongodb.collection).find({
      timestamp: { $gte: start, $lte: end },
      resolver: miner.address,
      miner: { $ne: miner.address } }).count()

    // get min/max block number between dates
    let max_block_number_array = await blockChainDB.collection(config.mongodb.trx_collection).find({
      addresses: { $all: [miner.address] },
      timestamp: { $gte: start, $lte: end }
    }
    ).sort({ block_number: -1 }).limit(1).toArray()
    let min_block_number_array = await blockChainDB.collection(config.mongodb.trx_collection).find({
      addresses: { $all: [miner.address] },
      timestamp: { $gte: start, $lte: end }
    }
    ).sort({ block_number: 1 }).limit(1).toArray()
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
      addresses: { $all: [miner.address] }
    }
    ).sort({ number: -1 }).limit(1).toArray()
    let gen_min_block_number_array = await blockChainDB.collection(config.mongodb.collection).find({
      addresses: { $all: [miner.address] }
    }
    ).sort({ number: 1 }).limit(1).toArray()

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
          $sum: '$amount'
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
          $sum: '$amount'
        }
      }
      }
    ]).toArray()

    let last_block_task = blockChainDB.collection(config.mongodb.collection).find({
      timestamp: { $gte: start, $lte: end }
    }).sort({ number: -1 }).limit(1).toArray()

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
    miner.balance = (miner.miner_balance - miner.trx_to_balance + miner.trx_from_balance) / 10000
    miner.total_supply_ratio = (miner.balance / totalSupply * 100).toFixed(BALANCE_RATIO_DECIMALS)
    miner.miner_balance = miner.miner_balance / 10000
    miner.trx_to_balance = miner.trx_to_balance / 10000
    miner.trx_from_balance = miner.trx_from_balance / 10000

    mongoDB.close()
  } catch (ex) {
    console.log(ex)
  }
  res.json(miner)
}

exports.get_latest_trx = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=120')

  let maxTransactions = 10
  let toTimestamp = new Date()
  toTimestamp = toTimestamp.getTime() / 1000 - 60 * 60 * 0
  let fromTimestamp = toTimestamp - 60 * 60 * 24

  let MongoClient = require('mongodb').MongoClient
  let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(config.mongodb.db)

  let latest_trxs = await blockChainDB.collection(config.mongodb.trx_collection).aggregate([
    {
      $match: {
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp }
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
    latest_trx = []
  }
  res.json({
    trxs: latest_trxs,
    trxs_number: latest_trxs.length
  })

  mongoDB.close()
}

exports.get_latest_miners = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=120')

  let maxMiners = 10
  let toTimestamp = new Date()
  toTimestamp = toTimestamp.getTime() / 1000 - 60 * 60 * 0
  let fromTimestamp = toTimestamp - 60 * 60 * 24

  let pages = 1
  let pageNumber = Number.parseInt(req.query.page_number)
  let pageSize = Number.parseInt(req.query.page_size)
  if (isNaN(pageNumber) || !pageNumber) {
    pageNumber = 1
  }
  if (isNaN(pageSize) || !pageSize || pageSize > 25 || pageSize < 10) {
    pageSize = 10
  }

  let MongoClient = require('mongodb').MongoClient
  let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(config.mongodb.db)

  let minersQuery = [
    {
      '$match': {
        number: {
          '$gte': 0
        },
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp }
      }
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
      $facet: {
        paginatedResults: [{ $skip: (pageNumber - 1) * pageSize }, { $limit: pageSize }],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]
  let minersResults = await blockChainDB.collection(config.mongodb.collection).aggregate(minersQuery).toArray()
  let miners = []
  let minersNumber = 0
  if (minersResults && minersResults.length == 1 && minersResults[0].paginatedResults
    && minersResults[0].totalCount && minersResults[0].totalCount[0]) {
    miners = minersResults[0].paginatedResults
    minersNumber = minersResults[0].totalCount[0].count
    pages = Math.ceil(minersNumber / pageSize)
  }

  let pow_miners_query = [
    {
      '$match': {
        number: {
          '$gte': 0
        },
        timestamp: { $gte: fromTimestamp, $lte: toTimestamp },
        algorithm: 'pow'
      }
    },
    {
      '$group': {
        '_id': '$miner',
        'blocks': {
          '$sum': 1
        }
      }
    }
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
    miners.forEach(function (m) {
      m.ratio = Math.round(m.reward / total_amount * 100 * 100) / 100
      m.pow_blocks = 0
      if (pow_miners && pow_miners.length > 0) {
        pow_miners.forEach(function (posMiner) {
          if (posMiner._id == m._id) {
            m.pow_blocks = posMiner.blocks
          }
        })
      }
      m.pos_blocks = m.blocks - m.pow_blocks
    })
  }
  res.json({
    miners: latest_miners,
    miners_number: minersNumber,
    pages: pages,
    page_size: pageSize,
    page_number: pageNumber
  })

  mongoDB.close()
}

async function getTransactions (address, pageNumber, pageSize, isFrom, isTo, trxType, trxOrder, fromDate, toDate) {
  let MongoClient = require('mongodb').MongoClient
  let mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  let blockChainDB = mongoDB.db(config.mongodb.db)
  let transactionsQuery = {}

  if (address && !isFrom && !isTo) {
    transactionsQuery.addresses = { $all: [address] }
  }
  if (address && isFrom) {
    transactionsQuery['from.address'] = { $all: [address] }
  }
  if (address && isTo) {
    transactionsQuery['to.address'] = { $all: [address] }
  }
  if (trxType) {
    let sizeFrom = 1
    let sizeTo = 1
    switch (trxType) {
      case ('SISO'):
        if (!transactionsQuery['from.address']) {
          transactionsQuery['from.address'] = { $size: sizeFrom }
        } else {
          transactionsQuery = { $and: [
            { 'from.address': { $size: sizeFrom } },
            { 'from.address': transactionsQuery['from.address'] }
          ] }
          delete transactionsQuery['from.address']
        }
        if (!transactionsQuery['to.address']) {
          transactionsQuery['to.address'] = { $size: sizeTo }
        } else {
          if (!transactionsQuery['$and']) {
            transactionsQuery = { $and: [
              { 'to.address': { $size: sizeFrom } },
              { 'to.address': transactionsQuery['to.address'] }
            ] }
          } else {
            transactionsQuery['$and'].push({ 'to.address': { $size: sizeFrom } }),
            transactionsQuery['$and'].push({ 'to.address': transactionsQuery['to.address'] })
          }
          delete transactionsQuery['to.address']
        }
        break
      case ('SIMO'):
        if (!transactionsQuery['from.address']) {
          transactionsQuery['to.address.1'] = { $exists: true }
          transactionsQuery['from.address'] = { $size: sizeFrom }
        } else {
          transactionsQuery = { $and: [
            { 'from.address': { $size: sizeFrom } },
            { 'from.address': transactionsQuery['from.address'] },
            { 'to.address.1': { $exists: true } }
          ] }
          delete transactionsQuery['from.address']
        }
        break
      case ('MISO'):
        if (!transactionsQuery['to.address']) {
          transactionsQuery['from.address.1'] = { $exists: true }
          transactionsQuery['to.address'] = { $size: sizeTo }
        } else {
          transactionsQuery = { $and: [
            { 'to.address': { $size: sizeTo } },
            { 'to.address': transactionsQuery['to.address'] },
            { 'from.address.1': { $exists: true } }
          ] }
          delete transactionsQuery['to.address']
        }
        break
      case ('MIMO'):
        transactionsQuery['from.address.1'] = { $exists: true }
        transactionsQuery['to.address.1'] = { $exists: true }
        break
    }
  }

  let orderQuery = {
    block_number: -1
  }

  if (trxOrder) {
    switch (trxOrder) {
      case ('DateAsc'):
        orderQuery = {
          block_number: 1
        }
        break
      case ('ValueDesc'):
        orderQuery = {
          from_amount: -1
        }
        break
      case ('ValueAsc'):
        orderQuery = {
          from_amount: 1
        }
        break
      case ('FeeDesc'):
        orderQuery = {
          fee: -1
        }
        break
      case ('FeeAsc'):
        orderQuery = {
          fee: 1
        }
        break
    }
  }

  if (fromDate && toDate) {
    if (!transactionsQuery) {
      transactionsQuery.timestamp = { $gte: fromDate, $lte: toDate }
    } else {
      transactionsQuery = { $and: [
        transactionsQuery,
        { timestamp: { $gte: fromDate, $lte: toDate } }
      ] }
    }
  }

  let trxsTask = blockChainDB.collection(config.mongodb.trx_collection).find(transactionsQuery)
    .sort(orderQuery).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()
  let trxsNumberTask = blockChainDB.collection(config.mongodb.trx_collection).find(transactionsQuery)
    .count()

  let trxs = await trxsTask
  let trxsNumber = await trxsNumberTask
  let pages = Math.ceil(trxsNumber / pageSize)

  let pendingTrxsNumber = 0
  if (pageNumber == 1) {
    let pending_trx = []
    try {
      pending_trx = await get_pending_trx(address)
    } catch (ex) {}
    if (pending_trx && pending_trx.trxs && pending_trx.trxs.length > 0) {
      pendingTrxsNumber = pending_trx.trxs.length
      trxs = pending_trx.trxs.concat(trxs)
    }
  }

  mongoDB.close()

  return {
    trxs: trxs,
    trxs_number: trxsNumber + pendingTrxsNumber,
    pages: pages
  }
}

exports.get_trx = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=40')

  let maxTransactions = 15
  let miner = ''
  let isFrom = false
  let isTo = false
  let trxType = ''
  let trxOrder = ''
  let start = new Date(1524743407 * 1000).getTime() / 1000
  let end = new Date().getTime() / 1000

  if (req.query.miner && req.query.miner.length === 40) {
    miner = req.query.miner
  }
  if (req.query.is_from && req.query.is_from === 'true') {
    isFrom = true
  }
  if (req.query.is_to && req.query.is_to === 'true') {
    isTo = true
  }
  if (req.query.trx_type && ['SISO', 'SIMO', 'MISO', 'MIMO'].indexOf(req.query.trx_type) > -1) {
    trxType = req.query.trx_type
  }
  if (req.query.trx_order && ['DateDesc', 'DateAsc', 'ValueDesc', 'ValueAsc', 'FeeDesc', 'FeeAsc']
    .indexOf(req.query.trx_order) > -1) {
    trxOrder = req.query.trx_order
  }
  let pageNumber = Number.parseInt(req.query.page_number)
  let pageSize = Number.parseInt(req.query.page_size)
  if (isNaN(pageNumber) || !pageNumber) {
    pageNumber = 1
  }
  if (isNaN(pageSize) || !pageSize || pageSize > 25 || pageSize < 15) {
    pageSize = 15
  }

  if (req.query.start_date && req.query.end_date) {
    start = new Date(req.query.start_date).getTime() / 1000
    end = new Date(req.query.end_date).getTime() / 1000
  }

  let trxData = await getTransactions(miner, pageNumber, pageSize, isFrom, isTo, trxType,
    trxOrder, start, end)

  res.json({
    trxs: trxData.trxs,
    trxs_number: trxData.trxs_number,
    page_number: pageNumber,
    pages: trxData.pages
  })
}

exports.get_uncle = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=40')

  let pageNumber = Number.parseInt(req.query.page_number)
  let pageSize = Number.parseInt(req.query.page_size)
  if (isNaN(pageNumber) || !pageNumber) {
    pageNumber = 1
  }
  if (isNaN(pageSize) || !pageSize || pageSize > 25 || pageSize < 15) {
    pageSize = 15
  }
  let miner
  let resolver
  if (req.query.miner) {
    miner = req.query.miner
  }
  if (req.query.resolver) {
    resolver = req.query.resolver
  }

  let uncles = []
  let MongoClient = require('mongodb').MongoClient
  try {
    var mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  } catch (ex) {
    console.log(ex)
    res.json()
    return
  }
  try {
    let blockChainDB = mongoDB.db(config.mongodb.db)
    let findQuery = {}
    if (miner) {
      findQuery.miner = miner
    }
    if (resolver) {
      findQuery.resolver = resolver
      findQuery.miner = { $ne: resolver }
    }
    let blocksTask = blockChainDB.collection(config.mongodb.collection).find(findQuery).sort({ number: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).toArray()

    let blocks = await blocksTask
    let blocksNumber = blocks.length
    let unclesMapped = {}
    for (let i = 0; i < blocksNumber - 1; i++) {
      let uncles = []
      try {
        uncles = await blockChainDB.collection(config.mongodb.uncle_collection).find({
          number: blocks[i + 1].number
        }).toArray()
      } catch (ex) {
        console.log(ex)
        console.log('Failed to get uncles')
      }
      let parents = []
      if (uncles && uncles.length) {
        if (uncles.length > 1) {
          console.log(uncles.length + ' forks for: ' + blocks[i + 1].number)
        }
        for (var uncle = 0; uncle < uncles.length; uncle++) {
          let hash = uncles[uncle].hash + uncles[uncle].miner + uncles[uncle].resolver + uncles[uncle].resolver2
          parents.push(hash)
          let isFork = true
          if (i == blocksNumber - 2) {
            isFork = false
          }
          unclesMapped[hash] = {
            number: uncles[uncle].number,
            timestamp: uncles[uncle].timestamp,
            difficulty: 13,
            hash: hash,
            is_fork: isFork,
            parents: []
          }
        }
      }
      if (parents.length == 0) {
        let parent = await blockChainDB.collection(config.mongodb.collection).find({
          hash: blocks[i].previous_hash
        }).toArray()
        if (parent && parent.length == 1) {
          parents = [ parent[0].hash + parent[0].miner + parent[0].resolver + parent[0].resolver2 ]
        }
      }
      let hashBlock = blocks[i].hash + blocks[i].miner + blocks[i].resolver + blocks[i].resolver2
      if (unclesMapped[hashBlock]) {
        unclesMapped[hashBlock].parents = parents
        unclesMapped[hashBlock].is_fork = false
      } else {
        unclesMapped[hashBlock] = {
          number: blocks[i].number,
          timestamp: blocks[i].timestamp,
          difficulty: 13,
          hash: hashBlock,
          parents: parents,
          is_fork: false
        }
      }
    }
    let pages = Math.ceil(blocksNumber / pageSize)
    res.json({
      result: true,
      uncles: unclesMapped,
      page_number: pageNumber,
      pages: pages,
      uncles_number: blocksNumber
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

async function get_pending_trx (address) {
  var options = {
    uri: config.webdollar.pouchdb_sync_url + '/transactions/pending',
    json: true
  }

  let pending_transactions = await requestPromise(options)
  let transactions = []
  pending_transactions.forEach(function (transaction) {
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
      var isValidTrx = false
      transaction.from.addresses.forEach(function (from) {
        if (address && from.address == address) {
          isValidTrx = true
        }
        transaction_parsed.from.address.push(from.address)
        transaction_parsed.from.amount += parseInt(from.amount)
      })

      transaction.to.addresses.forEach(function (to) {
        if (address && to.address == address) {
          isValidTrx = true
        }
        transaction_parsed.to.address.push(to.address)
        to_amount += parseInt(to.amount)
      })

      transaction_parsed.fee = transaction_parsed.from.amount - to_amount
      if (isValidTrx) {
        transactions.push(transaction_parsed)
      }
    } catch (ex) {
      console.log(ex)
    }
  })
  return {
    trxs: transactions,
    trxs_number: transactions.length
  }
}

async function getStars (address, depth, addresses, stars, first) {
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

  try {
    let start = new Date().getTime() / 1000 - 3600 * 24
    let end = new Date().getTime() / 1000
    let trxsData = await getTransactions(address, 1, 1000, '', '', '', '', start, end)
    let current_addresses = []
    trxsData.trxs.forEach(function (transaction) {
      let is_from = false
      let is_to = false
      let from_addresses = []
      let to_addresses = []
      transaction.from.address.forEach(function (from) {
        if (!addresses.includes(from)) {
          from_addresses.push(from)
        }
        if (from == address) {
          is_from = true
        }
      })
      transaction.to.address.forEach(function (to) {
        if (!addresses.includes(to)) {
          to_addresses.push(to)
        }
        if (to == address) {
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

    current_addresses.forEach(function (curr_address) {
      if (!addresses.includes(curr_address)) {
        addresses.push(curr_address)
        stars.nodes.push({
          id: curr_address,
          group: (depth + 1) * 13
        })
        stars.links.push({
          source: address,
          target: curr_address,
          value: 1
        })
      }
    })
    if (depth == 1) {
      return Promise.resolve(stars)
    } else {
      let stars1 = []
      current_addresses.forEach(function (curr_address) {
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
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=240')

  let address = req.params.address
  let depth = 1
  if (req.query.depth) {
    depth = parseInt(req.query.depth)
  }

  if (address.length != 40 || depth > MAX_DEPTH + 1) {
    res.json(false)
    return
  }
  let stars = []
  try {
    stars = await getStars(address, depth, [], { nodes: [], links: [] }, true)
  } catch (ex) {
    console.log(ex)
  }
  res.json(stars)
}

exports.get_ts_items = async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cache-Control', 'public, max-age=2')
  let address = req.query.miner
  if (!address || address.length != 40) {
    address = ''
  }
  let type = req.query.type

  let MongoClient = require('mongodb').MongoClient
  try {
    var mongoDB = await MongoClient.connect(config.mongodb.url, { useNewUrlParser: true })
  } catch (ex) {
    console.log(ex)
    res.json()
    return
  }
  let blockChainDB = mongoDB.db(config.mongodb.db)
  let timeInterval = 24 * 3600 * 1 // daily
  let itemNumber = { $sum: 1 }
  let multiplierId = 1000
  let dividerItemNumber = 1
  let maxBlocks = 1000000
  let blocksMatch = {
    number: {
     '$gte': Number(0),
     '$lte': Number(maxBlocks)
    }
  }
  let trxsMatch = {
    block_number: {
     '$gte': Number(0),
     '$lte': Number(maxBlocks)
    }
  }
  let amountReceivedMatch = {
    block_number: {
     '$gte': Number(0),
     '$lte': Number(718878)
    }
  }

  if (address) {
    blocksMatch.miner = address
    amountReceivedMatch.address = address
    amountReceivedMatch.type = 1
    trxsMatch.addresses = { $all: [address] }
  }
  let match = blocksMatch
  let matchCollection = config.mongodb.collection
  if (type === 'trxs') {
    match = trxsMatch
    matchCollection = config.mongodb.trx_collection
  }
  if (type === 'amount_received' || type === 'amount_sent') {
    match = amountReceivedMatch
    if (type === 'amount_sent') amountReceivedMatch.type = 0
    matchCollection = config.mongodb.mtrx_collection
    itemNumber = { $sum: "$amount" }
    dividerItemNumber = 10000
  }
  let items = await blockChainDB.collection(matchCollection).aggregate([
    {
        '$match': match
    },
    {
      '$project': {
        _id : 0,
	amount: '$amount',
        items_per_interval : {
          "$multiply" : [
            { "$floor" :
              { "$divide" : [
                "$timestamp",
                timeInterval
              ]}
            },
            timeInterval
          ]
        }
      }
    },
    {
      $group: {
        _id : "$items_per_interval",
        items_number : itemNumber
      }
    },
    {
      $sort: {
        '_id': 1
      }
    }
  ]).toArray()

  let itemsParsed = []
  for (let index = 0; index < items.length; index ++) {
    itemsParsed.push([Math.ceil(items[index]._id * multiplierId), items[index].items_number / dividerItemNumber])
  }
  mongoDB.close()
  res.json(itemsParsed)
}
