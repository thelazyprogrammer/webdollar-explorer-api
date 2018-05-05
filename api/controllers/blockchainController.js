'use strict';
var atob = require('atob'),
  bs58 = require('bs58'),
  BlockchainDB = require('nano')('http://localhost:5984').use('blockchaindb');

exports.list_all_blocks = function(req, res) {
  BlockchainDB.list({ limit:20, descending:true, attachments:true, include_docs:true }, function (err, body) {
    var blocks = []
    body.rows.forEach(function(doc) {
      var block = {
        'block_id': doc.id,
        'block_length': doc
      }
      blocks.push(block)
    });
    res.json(blocks);
  })
};

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

exports.read_a_block = function(req, res) {
  var blockId = 'block' + parseInt(req.params.blockId);
  BlockchainDB.get(blockId, {attachments:true, include_docs:true}, function (err, body) {
    if (!(body)) {
       res.status(404).send('Not found');
    } else {
      // Primary data
      var  block_raw = body._attachments.key.data
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
      var miner_address_decoded = encodeBase64(miner_address)

      // TRX data
      var trxs_hash_data = substr(block_hex, 126, 32).toString('hex')
      var trxs_number = deserializeNumber(substr(block_hex, 158, 4))
      var trxs_container = []
      if (trxs_number > 0) {
        var block_offset = 162
        var trx_block_length = 69
        for(var i=0;i<trxs_number;i++) {
            var current_block_offset = block_offset + (i * trx_block_length)
            var trx_version = deserializeNumber(substr(block_hex, current_block_offset, 1))
            var trx_nonce = deserializeNumber(substr(block_hex, current_block_offset + 1, 1))
            var trx_time_lock = deserializeNumber(substr(block_hex, current_block_offset + 2, 3))
            var trx_from_length = deserializeNumber(substr(block_hex, current_block_offset + 2 + 3, 1))
            var trx_from_address = substr(block_hex, current_block_offset + 2 + 3 + 1, 20).toString('hex')
            var trx_from_pub_key = substr(block_hex, current_block_offset + 2 + 3 + 1 + 20, 32).toString('hex')
            var trx_from_signature = substr(block_hex, current_block_offset + 2 + 3 + 1 + 20 + 32, 64).toString('hex')
            var trx_from_amount = deserializeNumber8BytesBuffer(block_hex, current_block_offset + 2 + 3 + 1 + 20 + 32 + 64)/10000
            var trx_from = {
              'address': trx_from_address,
              'public_key': trx_from_pub_key,
              //'signature': trx_from_signature,
              'amount': trx_from_amount
            }
            var trx_to = {
            }

            var trx = {
              //'version' : trx_version,
              //'nonce' : trx_nonce,
              //'time_lock' : trx_time_lock,
              //'from_length' : trx_from_length,
              'from': trx_from,
              'to': trx_to
            }
            trxs_container.push(trx)
        }
      }

      res.json({
        'id' : body._id.replace('block',''),
        'hash' : block_hash,
        //'nonce' : block_nonce,
        //'version' : block_version,
        //'previous_hash' : block_hashPrev,
        'timestamp' : human_timestamp,
        //'hash_data' : block_hash_data,
        'miner_address' : miner_address,
        //'miner_address_bs58' : miner_address_encoded,
        //'miner_address_decoded' : miner_address_decoded,
        //'trxs_hash_data': trxs_hash_data,
        //'trxs_number': trxs_number,
        'trxs': trxs_container
        //'block_hex' : block_hex.toString('hex'),
        //'block_raw' : block_raw
        });
      }
    })
};
