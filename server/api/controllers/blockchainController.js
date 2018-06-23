'use strict';
var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  request = require('request'),
  config = require('../../config'),
  BlockchainDB = require('nano')(config.couchdb.host).use(config.couchdb.db_name),
  BlockchainSyncerDB = require('nano')(config.couchdb.host).use(config.couchdb.syncer.db_name),
  blockchainUtils = require('../blockchain/utils');

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

exports.list_all_blocks = function(req, res) {
  var blocks = [];
  var max_block_length;
  var max_blocks = 14;

  res.header("Cache-Control", "public, max-age=100")
  res.header("Access-Control-Allow-Origin", "*");

  BlockchainSyncerDB.view('blocks', 'ordered_blocks', {
      'limit': max_blocks,
      'descending': true,
      'include_docs': true
    },
    function(err, body) {
      if (!err) {
        body.rows.forEach(function(block) {
          blocks.push(block.value)
        })
        res.json(blocks)
        return
      } else {
        console.log(err)
        res.json(blocks)
        return
      }
  });
}

exports.read_a_block = function(req, res) {
  var blockId = parseInt(req.params.blockId);

  res.header("Cache-Control", "public, max-age=100")
  res.header("Access-Control-Allow-Origin", "*");

  BlockchainSyncerDB.view(config.couchdb.syncer.view_name, config.couchdb.syncer.view_doc_name, {
      'key': blockId,
      'include_docs': true
    },
    function(err, body) {
      if (!err) {
        if (body.rows.length == 1) {
          var block = body.rows[0].value
          var block_trxs = []
          block.trxs.forEach(function(trx) {
            var block_trx = trx
            block_trx.from.amount = trx.from.amount / AMOUNT_DIVIDER
            block_trx.to.amount = trx.to.amount / AMOUNT_DIVIDER
            block_trx.fee = trx.fee / AMOUNT_DIVIDER
            block_trxs.push(block_trx)
          })
          block.trxs = block_trxs
          var reward = REWARD
          if (block.block_id < 41) {
            reward = blockchainUtils.FIRST_BLOCK_REWARDS[block.block_id] * AMOUNT_DIVIDER
          }
          block.reward = reward / AMOUNT_DIVIDER
          res.json(block)
        } else {
          console.log(body)
          res.status(404).send('Not found');
          return
        }
      } else {
        console.log(err)
        res.status(404).send('Not found');
        return
      }
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
        block_parsed.id = block_parsed.blockId
        var date = new Date((block_parsed.timestamp + 1524742312) * 1000)
        block_parsed.timestamp = date.toUTCString()
        block_parsed.trxs = block_parsed.transactions

        blocks_parsed.push(block_parsed)
      })
      miner.blocks = blocks_parsed
      miner.blocks = miner.blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))

      var transactions_parsed = []
      miner.trx_to_balance = 0
      miner.trx_from_balance = 0
      miner_received.transactions.forEach(function(transaction) {
        var transaction_parsed = transaction
        transaction_parsed.block_id = transaction.blockId
        transaction_parsed.id = transaction.blockId
        var date = new Date((transaction.timestamp + 1524742312) * 1000)
        transaction_parsed.timestamp = date.toUTCString()
        transaction_parsed.fee = 0
        var to_amount = 0

        transaction_parsed.from = {
          amount: 0,
          address: []
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
        transaction_parsed.fee = transaction_parsed.fee / AMOUNT_DIVIDER
        transaction_parsed.from.amount = transaction_parsed.from.amount / AMOUNT_DIVIDER

        transactions_parsed.push(transaction_parsed)
      })
      miner.transactions = transactions_parsed
      miner.transactions = miner.transactions.sort((a, b) => Number(b.block_id) - Number(a.block_id))
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
