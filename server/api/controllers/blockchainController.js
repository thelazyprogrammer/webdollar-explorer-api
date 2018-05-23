'use strict';
var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  request = require('request'),
  BlockchainDB = require('nano')('http://localhost:5984').use('blockjs'),
  blockchainUtils = require('../blockchain/utils');

let AMOUNT_DIVIDER = 10000
let REWARD = AMOUNT_DIVIDER * 6000

exports.read_an_address = function(req, res) {
  var miner_address = req.params.address
  var miner = {
    'address': miner_address,
    'balance': 0,
    'miner_balance': 0,
    'miner_fee_balance': 0,
    'miner_fee_to_balance': 0,
    'trx_to_balance': 0,
    'trx_from_balance': 0,
    'blocks': [],
    'transactions': []
  }

  if (miner_address.length < 10) {
    res.header("Access-Control-Allow-Origin", "*");
    res.json(miner);
  } else {
    BlockchainDB.list({attachments:true, include_docs:true}, function (err, body) {
    body.rows.forEach(function(doc) {
      if (doc.doc._attachments) {
        var block_id = Number(doc.id.replace('block', ''))
        if (!isNaN(block_id)) {
          var reward = REWARD
          if (block_id < 41) {
            reward = blockchainUtils.FIRST_BLOCK_REWARDS[block_id] * AMOUNT_DIVIDER
          }
          var block_decoded = blockchainUtils.decodeRawBlock(block_id, doc.doc._attachments.key.data)
          if (block_decoded) {
            var is_miner = false
            if (block_decoded.miner_address.includes(miner_address)) {
                miner.address = block_decoded.miner_address
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
                miner.address = trx.from.address
                miner.miner_fee_to_balance =  miner.miner_fee_to_balance + trx.fee
                miner.trx_to_balance = miner.trx_to_balance + trx.from.amount
                has_trx =true
              }
              if (trx.to.address.includes(miner_address)) {
                miner.address = trx.to.address
                miner.trx_from_balance = miner.trx_from_balance + trx.from.amount
                has_trx =true
              }
              if (has_trx) {
                trx['timestamp'] = block_decoded.timestamp
                trx['block_id'] = block_decoded.id
                trx.from.amount = trx.from.amount / AMOUNT_DIVIDER
                trx.fee = trx.fee / AMOUNT_DIVIDER
                miner.transactions.push(trx)
              }
            })
            miner.transactions = miner.transactions.sort((a, b) => Number(b.block_id) - Number(a.block_id))
            miner.blocks = miner.blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))

            miner.balance = miner.miner_balance + miner.miner_fee_balance + miner.trx_from_balance - miner.trx_to_balance - miner.miner_fee_to_balance
          }
        }
      }
    })

    miner.balance = miner.balance / AMOUNT_DIVIDER
    miner.miner_balance = miner.miner_balance / AMOUNT_DIVIDER
    miner.miner_fee_balance = miner.miner_fee_balance / AMOUNT_DIVIDER
    miner.miner_trx_from_balance = miner.miner_trx_from_balance / AMOUNT_DIVIDER
    miner.miner_trx_to_balance = miner.miner_trx_to_balance / AMOUNT_DIVIDER
    miner.trx_to_balance = miner.trx_to_balance / AMOUNT_DIVIDER
    miner.trx_from_balance = miner.trx_from_balance / AMOUNT_DIVIDER
    miner.miner_fee_to_balance = miner.miner_fee_to_balance / AMOUNT_DIVIDER

    res.header("Cache-Control", "public, max-age=100")
    res.header("Access-Control-Allow-Origin", "*");
    res.json(miner);
  });
  }
};

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
