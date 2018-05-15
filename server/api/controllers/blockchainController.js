'use strict';
var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  BlockchainDB = require('nano')('http://localhost:5984').use('blockchai');

var PREFIX_BASE64 = "584043fe"
var SUFFIX_BASE64 = "FF"
var FIRST_BLOCK_REWARDS = [1, 1867487789, 1007804769, 552321669, 307400655, 173745886, 99728963, 58133318,
  34413271, 20688253, 12630447, 7830882, 4930598, 3152722, 2047239, 1350046, 904119,
  614893, 424689, 297878, 212180, 153485, 112752, 84116, 63728, 49032, 38311, 30400,
  24497, 20047, 16660, 14061, 12051, 10490, 9272, 8323, 7588, 7025, 6604, 6306, 6113]

function compare_blocks(block1, block2) {
   let comparison = 0
   let block_id_1 = Number(block1.block_id.replace('block', ''))
   let block_id_2 = Number(block2.block_id.replace('block', ''))
   if (block_id_1 > block_id_2) {
     comparison = 1
   }
   if (block_id_1 < block_id_2) {
     comparison = -1
   }
   return comparison
}

exports.read_an_address = function(req, res) {
  BlockchainDB.list({attachments:true, include_docs:true}, function (err, body) {
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
    body.rows.forEach(function(doc) {
      if (doc.doc._attachments) {
        var block_id = Number(doc.id.replace('block', ''))
        if (!isNaN(block_id)) {
          var reward = 6000
          if (block_id < 41) {
            reward = FIRST_BLOCK_REWARDS[block_id]
          }
          var block_decoded = decodeRawBlock(block_id, doc.doc._attachments.key.data)
          if (block_decoded) {
            var is_miner = false
            if (block_decoded.miner_address.includes(miner_address)) {
                miner.address = block_decoded.miner_address
                miner.blocks.push({
                  'block_id': block_decoded.id,
                  'timestamp': block_decoded.timestamp,
                  'trxs':  block_decoded.trxs.length
                })
                miner.balance += reward
                miner.miner_balance += reward
                is_miner = true
            }
            block_decoded.trxs.forEach(function(trx) {
              var has_trx = false
              if (is_miner) {
                miner.balance += trx.fee
                miner.miner_fee_balance = Number((miner.miner_fee_balance + trx.fee).toFixed(4))
              }
              if (trx.from.address.includes(miner_address)) {
                miner.address = trx.from.address
                miner.balance -= trx.from.amount
                miner.balance -= trx.fee
                miner.miner_fee_to_balance =  Number((miner.miner_fee_to_balance + trx.fee).toFixed(4))
                miner.trx_to_balance = Number((miner.trx_to_balance + trx.from.amount).toFixed(4))
                has_trx =true
              }
              if (trx.to.address.includes(miner_address)) {
                miner.address = trx.to.address
                miner.balance += trx.from.amount
                miner.trx_from_balance = Number((miner.trx_from_balance + trx.from.amount).toFixed(4))
                has_trx =true
              }
              if (has_trx) {
                trx['timestamp'] = block_decoded.timestamp
                trx['block_id'] = block_decoded.id
                miner.transactions.push(trx)
              }
            })
            miner.transactions = miner.transactions.sort((a, b) => Number(b.block_id) - Number(a.block_id))
            miner.blocks = miner.blocks.sort((a, b) => Number(b.block_id) - Number(a.block_id))
            miner.balance = Number((Number((Number((Number((miner.miner_balance + miner.miner_fee_balance).toFixed(4)) + miner.trx_from_balance).toFixed(4)) - miner.trx_to_balance).toFixed(4)) - miner.miner_fee_to_balance).toFixed(4))
          }
        }
      }
    })

    res.header("Cache-Control", "public, max-age=100")
    res.header("Access-Control-Allow-Origin", "*");
    res.json(miner);
  })
};

exports.list_all_blocks = function(req, res) {
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
      blocks_decoded.push(decodeRawBlock(block.block_id, block.data))
    })

    res.header("Cache-Control", "public, max-age=100")
    res.header("Access-Control-Allow-Origin", "*");
    res.json(blocks_decoded);
  });
}

function deserializeNumber(buffer){
  if(buffer.length === 1) return buffer[0]; else
  if (buffer.length === 2) return buffer[1] | (buffer[0] << 8); else
  if (buffer.length === 3) return buffer[2] | (buffer[1] << 8) | (buffer[0] << 16); else
  if (buffer.length === 4) return buffer[3] | (buffer[2] << 8) | (buffer[1] << 16) | (buffer[0] << 24); else
  if (buffer.length === 6) return buffer[5] | (buffer[4] << 8) | (buffer[3] << 16) | (buffer[2] << 24) | (buffer[1] << 32) | (buffer[0] << 40);
}

function substr(buffer, index, count){
 if (count === undefined)
   count = buffer.length;

 let length = Math.min(index + count, buffer.length);
 if (length-index <= 0)
   throw {message: "length-index <= 0...", buffer: buffer.toString("hex"), index:index, length:length, count: count};
  let buf = new Buffer(length-index);
  buffer.copy(buf, 0, index, length);
  return buf;
}

function decodeBase64(str) {
  if (typeof str !== "string") throw {message: "input is not string for base decoding", str:str};

  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '#') newStr +=  'O'; else
    if (str[i] === '@') newStr +=  'l'; else
    if (str[i] === '$') newStr +=  '/';
    else newStr += str[i];
  }
  let result = new Buffer(newStr, 'base64');
  return result;
}

function encodeBase64(buffer) {
  if (!Buffer.isBuffer(buffer))
    buffer = new Buffer(buffer);
  let result = buffer.toString('base64');
  let newStr = '';
  for (let i = 0; i < result.length; i++) {
    if (result[i] === 'O') newStr +=  '#'; else
    if (result[i] === 'l') newStr +=  '@'; else
    if (result[i] === '/') newStr +=  '$';
    else newStr += result[i];
  }
  return newStr;
}

function deserializeNumber8BytesBuffer(buffer, offset = 0) {
  let value = 0;
  for ( let i = offset + 6 ; i >= offset; i--)
    value = (value * 256) + buffer[i];
  return value;
}

function SHA256(bytes) {
  let sha256 = crypto.createHash('sha256'); //sha256
  sha256.update(bytes);
  return sha256.digest();
}

function decodeMinerAddress(miner_address) {
    var address = Buffer.concat([Buffer.from('00', "hex"), Buffer.from(miner_address, 'hex')])
    var checksum = SHA256(SHA256(address))
    checksum = substr(checksum, 0, 4)
    return encodeBase64(Buffer.concat([ Buffer.from(PREFIX_BASE64, 'hex'), address, checksum, Buffer.from(SUFFIX_BASE64, 'hex')]))
}

function decodeRawBlock(block_id, block_raw) {
      var block_hex = Buffer.from(atob(Buffer.from(block_raw, 'base64')), "hex")
      var block_hash = substr(block_hex, 0, 32).toString('hex')
      var block_nonce = deserializeNumber(substr(block_hex, 32, 4))
      var block_version = deserializeNumber(substr(block_hex, 36, 2))
      var block_hashPrev = substr(block_hex, 38, 32).toString('hex')
      var block_timestamp = deserializeNumber(substr(block_hex, 70, 4)) + 1524742312
      var human_timestamp = new Date(block_timestamp * 1000)

      // Secondary data
      var block_hash_data = substr(block_hex, 74, 32).toString('hex')
      var miner_address = substr(block_hex, 106, 20).toString('hex')
      var miner_address_encoded = bs58.encode(miner_address)
      var miner_address_decoded = decodeMinerAddress(miner_address)

      // TRX data
      var trxs_hash_data = substr(block_hex, 126, 32).toString('hex')
      var trxs_number = deserializeNumber(substr(block_hex, 158, 4))
      var trxs_container = []
      if (trxs_number > 0) {
        var block_offset = 162
        var current_block_offset = block_offset
        for(var i=0;i<trxs_number;i++) {
            var trx_version = deserializeNumber(substr(block_hex, current_block_offset, 1))
            var trx_nonce = deserializeNumber(substr(block_hex, current_block_offset + 1, 1))
            var trx_time_lock = deserializeNumber(substr(block_hex, current_block_offset + 2, 3))

            // Deserialize from trx data
            var trx_from_length = deserializeNumber(substr(block_hex, current_block_offset + 2 + 3, 1))
            var trx_from_address = substr(block_hex, current_block_offset + 2 + 3 + 1, 20).toString('hex')
            var trx_from_pub_key = substr(block_hex, current_block_offset + 2 + 3 + 1 + 20, 32).toString('hex')
            var trx_from_signature = substr(block_hex, current_block_offset + 2 + 3 + 1 + 20 + 32, 64).toString('hex')
            var trx_from_amount = deserializeNumber8BytesBuffer(block_hex, current_block_offset + 2 + 3 + 1 + 20 + 32 + 64)
            var trx_from_currency_length = deserializeNumber(substr(block_hex, current_block_offset + 2 + 3 + 1 + 20 + 32 + 64 + 7, 1))
            var trx_from_currency_token = substr(block_hex, current_block_offset + 2 + 3 + 1 + 20 + 32 + 64 + 7 + 1, trx_from_currency_length).toString('hex')
            var trx_from = {
              //'address': trx_from_address,
              'address': decodeMinerAddress(trx_from_address),
              //'public_key': trx_from_pub_key,
              //'signature': trx_from_signature,
              'amount': trx_from_amount/10000,
              //'currency_length': trx_from_currency_length,
              //'currency_token': trx_from_currency_token
            }

            // Deserialize to trx data
            var trx_to_block_offset = current_block_offset + 2 + 3 + 1 + 20 + 32 + 64 + 7 + 1 + trx_from_currency_length
            var trx_to_length = deserializeNumber(substr(block_hex, trx_to_block_offset, 1))
            var trx_to_address = substr(block_hex, trx_to_block_offset + 1, 20).toString('hex')
            var trx_to_amount = deserializeNumber8BytesBuffer(block_hex, trx_to_block_offset + 1 + 20)
            var trx_to = {
              //'trx_to_length': trx_to_length,
              //'address_base': trx_to_address,
              'address': decodeMinerAddress(trx_to_address),
              //'amount': trx_to_amount/1000
            }
            trx_from['amount'] = trx_to_amount/10000
            var trx_fee = (trx_from_amount - trx_to_amount)/10000
            var trx = {
              //'version' : trx_version,
              //'nonce' : trx_nonce,
              //'time_lock' : trx_time_lock,
              //'from_length' : trx_from_length,
              'from': trx_from,
              'to': trx_to,
              'fee': trx_fee,
              'block_id': block_id,
              'timestamp': human_timestamp.toUTCString()
            }
            trxs_container.push(trx)
            current_block_offset = trx_to_block_offset + 1 + 20 + 7
        }
      }

      return {
        'id' : block_id,
        'block_id' : block_id,
        //'hash' : block_hash,
        //'nonce' : block_nonce,
        //'version' : block_version,
        //'previous_hash' : block_hashPrev,
        'timestamp' : human_timestamp.toUTCString(),
        //'hash_data' : block_hash_data,
        //'miner_address' : miner_address,
        //'miner_address_bs58' : miner_address_encoded,
        'miner_address' : miner_address_decoded,
        //'trxs_hash_data': trxs_hash_data,
        //'trxs_number': trxs_number,
        'trxs': trxs_container
        //'block_hex' : block_hex.toString('hex'),
        //'block_raw' : block_raw
      }
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
      res.json(decodeRawBlock(body._id.replace('block',''), body._attachments.key.data))
    }
  })
};
