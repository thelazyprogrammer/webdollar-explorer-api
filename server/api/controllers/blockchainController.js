'use strict';
var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  request = require('request'),
  BlockchainDB = require('nano')('http://localhost:5984').use('blockjs'),
  blockchainUtils = require('../blockchain/utils');

const NodeCouchDb = require('node-couchdb');
const couchAuth = new NodeCouchDb({
    auth: {
        user: 'admin',
        pass: 'Passw0rd'
    }
});

const AMOUNT_DIVIDER = 10000
const REWARD = AMOUNT_DIVIDER * 6000
const ADDRESS_CACHE_DB = "address"
const BALANCE_RATIO_DECIMALS = 5

function getEmptyAddress(miner_address) {
  return {
    'address': miner_address,
    'balance': 0,
    'total_supply_ratio': 0,
    'last_block': 0,
    'miner_balance': 0,
    'miner_fee_balance': 0,
    'miner_fee_to_balance': 0,
    'trx_to_balance': 0,
    'trx_from_balance': 0,
    'blocks': [],
    'transactions': []
  }
}

function computeAddress(miner, miner_address, docs) {
  docs.forEach(function(doc) {
    if (!doc.doc._attachments) {
      return
    }

    var block_id = Number(doc.id.replace('block', ''))
    if (isNaN(block_id)) {
      return
    }

    if (miner.last_block < block_id) {
      miner.last_block = block_id
    }

    var reward = REWARD
    if (block_id < 41) {
      reward = blockchainUtils.FIRST_BLOCK_REWARDS[block_id] * AMOUNT_DIVIDER
    }

    var block_decoded = blockchainUtils.decodeRawBlock(block_id, doc.doc._attachments.key.data)
    if (!block_decoded) {
      return
    }
    var is_miner = false
    if (block_decoded.miner_address == miner_address) {
      miner.blocks.push({
        'block_id': block_decoded.id,
        'timestamp': block_decoded.timestamp,
        'trxs':  block_decoded.trxs.length
      })
      miner.miner_balance += reward
      is_miner = true
    }

    block_decoded.trxs.forEach(function(trx) {
      var has_trx = false
      if (is_miner) {
        miner.miner_fee_balance = miner.miner_fee_balance + trx.fee
      }

      if (trx.from.address.includes(miner_address)) {
        var to_amount = 0
        trx.from.trxs.forEach(function(from_trx) {
          if (miner_address == from_trx.trx_from_address) {
            to_amount += from_trx.trx_from_amount
          }
        })
        //miner.miner_fee_to_balance =  miner.miner_fee_to_balance + trx.fee
        miner.trx_to_balance = miner.trx_to_balance + to_amount
        has_trx = true
      }
      if (trx.to.address.includes(miner_address)) {
        var from_amount = 0
        trx.to.trxs.forEach(function(to_trx) {
          if (miner_address == to_trx.trx_to_address) {
            from_amount += to_trx.trx_to_amount
          }
        })
        miner.trx_from_balance = miner.trx_from_balance + from_amount
        has_trx = true
      }
      if (has_trx) {
        trx['timestamp'] = block_decoded.timestamp
        trx['block_id'] = block_decoded.id
        trx.from.amount = trx.from.amount / AMOUNT_DIVIDER
        trx.fee = trx.fee / AMOUNT_DIVIDER
        miner.transactions.push(trx)
      }
    });
    miner.transactions = miner.transactions.sort((a, b) => Number(b.block_id) - Number(a.block_id))
    miner.blocks = miner.blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))
    miner.balance = miner.miner_balance + miner.miner_fee_balance + miner.trx_from_balance - miner.trx_to_balance - miner.miner_fee_to_balance
  });

  return miner
}

function syncAddressDB(miner) {
  let sha256 = crypto.createHash('sha256'); //sha256
  sha256.update(Buffer(miner.address));
  var address_sha256 = sha256.digest().toString('hex');
  console.log("caching address " + address_sha256)
  couchAuth.get(ADDRESS_CACHE_DB, address_sha256).then(({data, headers, status}) => {
    couchAuth.update(ADDRESS_CACHE_DB, {
      _id: data._id,
      _rev: data._rev,
      miner: miner,
      transactions: miner.transactions,
      blocks: miner.blocks
    }).then(({data, headers, status}) => {}, err => {});
  }, err => {
    couchAuth.insert(ADDRESS_CACHE_DB, {
      _id: address_sha256,
      miner: miner,
      transactions: miner.transactions,
      blocks: miner.blocks
    }).then(({data, headers, status}) => {}, err => {});
  });
}

function readAddressWithoutCache(miner_address, miner, res) {
  BlockchainDB.list({attachments:true, include_docs:true}, function (err, body) {
    if (err) {
      console.error(err)
      res.json(miner)
      return
    }
    miner = computeAddress(miner, miner_address, body.rows)
    miner.balance = miner.balance / AMOUNT_DIVIDER
    var totalSupply = blockchainUtils.getTotalSupply(miner.last_block)
    miner.total_supply_ratio = (miner.balance / totalSupply * 100).toFixed(BALANCE_RATIO_DECIMALS)
    miner.miner_balance = miner.miner_balance / AMOUNT_DIVIDER
    miner.miner_fee_balance = miner.miner_fee_balance / AMOUNT_DIVIDER
    miner.trx_to_balance = miner.trx_to_balance / AMOUNT_DIVIDER
    miner.trx_from_balance = miner.trx_from_balance / AMOUNT_DIVIDER
    miner.miner_fee_to_balance = miner.miner_fee_to_balance / AMOUNT_DIVIDER

    syncAddressDB(miner)
    res.json(miner);
   });
}


function readAddressWithCache(miner_address, miner, res) {
  let sha256 = crypto.createHash('sha256'); //sha256
  sha256.update(Buffer(miner.address));
  let address_sha256 = sha256.digest().toString('hex');
  console.log("Miner address sha256 is: " + address_sha256)

  couchAuth.get(ADDRESS_CACHE_DB, address_sha256).then(({data, headers, status}) => {
    var previous_miner = data.miner
    previous_miner.blocks = data.blocks
    previous_miner.transactions = data.transactions
    console.log("Found cached address: " + miner.address)
    if (previous_miner.miner_balance < 0.0001 && previous_miner.trx_from_balance < 0.0001) {
      console.log("DB entry should not be here. Retrying without cache")
      readAddressWithoutCache(miner_address, miner, res)
      return
    }
    request.get('http://localhost:10000', function (error, response, body) {
      if (error) {
        console.error(error)
        res.json(miner)
        return
      }
      try {
        var keys = []
        var last_block = JSON.parse(body).blocks.length - 1
        for (var i = previous_miner.last_block; i < last_block; i++) {
          keys.push("block" + i)
        }
        BlockchainDB.list({keys:keys, attachments:true, include_docs:true}, function (err, body) {
          if (!err && body && body.rows) {
            miner = computeAddress(miner, miner_address, body.rows)
            miner.balance = (miner.balance + previous_miner.balance * AMOUNT_DIVIDER) / AMOUNT_DIVIDER
            miner.last_block = last_block
            miner.miner_balance = (miner.miner_balance + previous_miner.miner_balance * AMOUNT_DIVIDER) / AMOUNT_DIVIDER
            miner.miner_fee_balance = (miner.miner_fee_balance + previous_miner.miner_fee_balance * AMOUNT_DIVIDER) / AMOUNT_DIVIDER
            miner.miner_fee_to_balance = (miner.miner_fee_to_balance + previous_miner.miner_fee_to_balance * AMOUNT_DIVIDER) / AMOUNT_DIVIDER
            miner.trx_to_balance = (miner.trx_to_balance + previous_miner.trx_to_balance * AMOUNT_DIVIDER) / AMOUNT_DIVIDER
            miner.trx_from_balance = (miner.trx_from_balance + previous_miner.trx_from_balance * AMOUNT_DIVIDER) / AMOUNT_DIVIDER

            miner.blocks = previous_miner.blocks.concat(miner.blocks)
            miner.transactions = previous_miner.transactions.concat(miner.transactions)

            miner.transactions = miner.transactions.sort((a, b) => Number(b.block_id) - Number(a.block_id))
            miner.blocks = miner.blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))

            var totalSupply = blockchainUtils.getTotalSupply(miner.last_block)
            miner.total_supply_ratio = (miner.balance / totalSupply * 100).toFixed(BALANCE_RATIO_DECIMALS)
            syncAddressDB(miner)
            res.json(miner)
          } else {
            readAddressWithoutCache(miner_address, miner, res)
          }
        });
       } catch (e) {
         console.error(e)
         console.log("Failed retrying with cache. Retrying without cache")
         readAddressWithoutCache(miner_address, miner, res)
         return
       }
    });
  }, err => {
    readAddressWithoutCache(miner_address, miner, res)
    return
  });
}

exports.read_an_address = function (req, res) {
  var miner_address = req.params.address
  var miner = getEmptyAddress(miner_address)

  res.header("Cache-Control", "public, max-age=100")
  res.header("Access-Control-Allow-Origin", "*");

  if (miner_address.length != 40) {
    console.log("Address " + miner_address + " is not 40 char long")
    res.json(miner);
    return
  }
  console.log("Miner address is: " + miner.address)
  readAddressWithCache(miner_address, miner, res)
}

exports.list_all_blocks = function(req, res) {
  var blocks = [];
  var max_block_length;
  var max_blocks = 14;
  try {
    request.get('http://localhost:10000', function (error, response, body) {
      try {
        max_block_length = JSON.parse(body).blocks.length - 1
        var keys = []
        for (var i = 0; i < max_blocks; i++) {
          keys.push("block" + (max_block_length - i))
        }
        BlockchainDB.list({keys: keys, attachments:true, include_docs:true}, function (err, body) {
          var blocks_decoded = []
          body.rows.forEach(function(block) {
            if (block.id) {
              blocks_decoded.push(blockchainUtils.decodeRawBlock(Number(block.id.replace('block', '')),
                                  block.doc._attachments.key.data))
            }
          });
          res.header("Access-Control-Allow-Origin", "*");
          res.json(blocks_decoded)
        });
       } catch (e) {
         console.log(e)
         getBlocksFallback(res)
       }
    });
   } catch (e) {
     console.log(e)
     getBlocksFallback(res)
   }
}

function getBlocksFallback(res) {
  BlockchainDB.list({attachments:true, include_docs:true}, function (err, body) {
    var blocks = []
    body.rows.forEach(function(doc) {
      if (doc.doc._attachments) {
      var block = {
        'block_id': Number(doc.id.replace('block', '')),
        'data': doc.doc._attachments.key.data
      }
      if (!isNaN(block.block_id))
        blocks.push(block)}
    });

    blocks = blocks.sort((a, b) => b.block_id - a.block_id).slice(0,14)
    var blocks_decoded = []
    blocks.forEach(function(block) {
      blocks_decoded.push(blockchainUtils.decodeRawBlock(block.block_id, block.data))
    })

    res.header("Cache-Control", "public, max-age=100")
    res.header("Access-Control-Allow-Origin", "*");
    res.json(blocks_decoded);
  });
}

exports.read_a_block = function(req, res) {
  var blockId = 'block' + parseInt(req.params.blockId);
  BlockchainDB.get(blockId, {attachments:true, include_docs:true}, function (err, body) {
    if (!(body)) {
       res.status(404).send('Not found');
    } else {
      // Primary data
      res.header("Cache-Control", "public, max-age=100")
      res.header("Access-Control-Allow-Origin", "*");
      res.json(blockchainUtils.decodeRawBlock(body._id.replace('block',''), body._attachments.key.data, true))
    }
  })
};
