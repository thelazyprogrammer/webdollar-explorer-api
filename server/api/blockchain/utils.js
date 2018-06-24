'use strict';
var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto');

const PREFIX_BASE64 = "584043fe"
const SUFFIX_BASE64 = "FF"
const BASE_REWARD = 6000
const FIRST_BLOCK_REWARDS = [1, 1867487789, 1007804769, 552321669, 307400655, 173745886, 99728963, 58133318,
  34413271, 20688253, 12630447, 7830882, 4930598, 3152722, 2047239, 1350046, 904119,
  614893, 424689, 297878, 212180, 153485, 112752, 84116, 63728, 49032, 38311, 30400,
  24497, 20047, 16660, 14061, 12051, 10490, 9272, 8323, 7588, 7025, 6604, 6306, 6113]
exports.FIRST_BLOCK_REWARDS = FIRST_BLOCK_REWARDS
const TRX_NONCE_V2_BLOCK = 46950

function deserializeNumber(buffer){
  if(buffer.length === 1) return buffer[0]; else
  if (buffer.length === 2) return buffer[1] | (buffer[0] << 8); else
  if (buffer.length === 3) return buffer[2] | (buffer[1] << 8) | (buffer[0] << 16); else
  if (buffer.length === 4) return buffer[3] | (buffer[2] << 8) | (buffer[1] << 16) | (buffer[0] << 24); else
  if (buffer.length === 6) return buffer[5] | (buffer[4] << 8) | (buffer[3] << 16) | (buffer[2] << 24) | (buffer[1] << 32) | (buffer[0] << 40);
}

function substr(buffer, index, count){
  if (count === undefined) {
    count = buffer.length;
  }

  let length = Math.min(index + count, buffer.length);
  if (length-index <= 0) {
    throw {message: "length-index <= 0...", buffer: buffer.toString("hex"), index:index, length:length, count: count};
  }

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
  return (new Buffer(newStr, 'base64'));
}

function encodeBase64(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    buffer = new Buffer(buffer);
  }
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

exports.decodeMinerAddress = function(miner_address) {
  return decodeMinerAddress(miner_address)
}

exports.decodeRawBlock = function(block_id, block_raw, divide_amounts) {
      var block_hex = Buffer.from(atob(Buffer.from(block_raw, 'base64')), "hex")
      const AMOUNT_DIVIDER = 10000
      var amountDivider = 1
      if (divide_amounts) {
        amountDivider = AMOUNT_DIVIDER
      }

      const OFFSET_1 = 1
      const OFFSET_2 = 2
      const OFFSET_3 = 3
      const OFFSET_4 = 4
      const OFFSET_7 = 7
      const OFFSET_20 = 20
      const OFFSET_32 = 32
      const OFFSET_64 = 64

      var OFFSET_BLOCK_HASH = OFFSET_32
      var OFFSET_BLOCK_NONCE = OFFSET_4
      var OFFSET_BLOCK_VERSION = OFFSET_2
      var OFFSET_BLOCK_TIMESTAMP = OFFSET_4
      var OFFSET_ADDRESS = OFFSET_20
      var OFFSET_TRX_NUMBER = OFFSET_4

      var CURRENT_OFFSET = 0
      //var block_hash = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      //var block_nonce = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_NONCE))
      CURRENT_OFFSET += OFFSET_BLOCK_NONCE
      //var block_version = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_VERSION))
      CURRENT_OFFSET += OFFSET_BLOCK_VERSION
      //var block_hashPrev = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var block_timestamp = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_TIMESTAMP)) + 1524742312
      CURRENT_OFFSET += OFFSET_BLOCK_TIMESTAMP
      var human_timestamp = new Date(block_timestamp * 1000)

      // Secondary data
      //var block_hash_data = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var miner_address = substr(block_hex, CURRENT_OFFSET, OFFSET_ADDRESS).toString('hex')
      CURRENT_OFFSET += OFFSET_ADDRESS
      var miner_address_decoded = decodeMinerAddress(miner_address)

      // TRX data
      //var trxs_hash_data = substr(block_hex, CURRENT_OFFSET, OFFSET_BLOCK_HASH).toString('hex')
      CURRENT_OFFSET += OFFSET_BLOCK_HASH
      var trxs_number = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_NUMBER))
      CURRENT_OFFSET += OFFSET_TRX_NUMBER

      var trxs_container = []
      if (trxs_number > 0) {
        for(var i=0;i<trxs_number;i++) {
          var OFFSET_TRX_VERSION = OFFSET_1
          var OFFSET_TRX_NONCE = OFFSET_1
          var OFFSET_TRX_LENGTH = OFFSET_1
          var OFFSET_TRX_NONCE_V2 = OFFSET_2
          var OFFSET_TRX_TIME_LOCK = OFFSET_3
          var OFFSET_TRX_PUB_KEY = OFFSET_32
          var OFFSET_TRX_SIGN = OFFSET_64
          var OFFSET_NUMBER = OFFSET_7
          
          //var trx_version = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_VERSION))
          CURRENT_OFFSET += OFFSET_TRX_VERSION
          
          // HARD FORK change for TRX NONCE
          if (block_id > TRX_NONCE_V2_BLOCK) {
            OFFSET_TRX_NONCE = OFFSET_TRX_NONCE_V2
          }
          //var trx_nonce = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_NONCE))
          CURRENT_OFFSET += OFFSET_TRX_NONCE

          //var trx_time_lock = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_TIME_LOCK))
          CURRENT_OFFSET += OFFSET_TRX_TIME_LOCK

          // Deserialize from trx data
          var trx_from_length = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_LENGTH))
          CURRENT_OFFSET += OFFSET_TRX_LENGTH

          if (trx_from_length < 0) {
              console.log("trx_from_length should be greater than 0.")
              continue
          }
          var trxs_from = {
            'trxs': [],
            'address': [],
            'amount': 0,
          }
          for (var from_address_index=0;from_address_index<trx_from_length; from_address_index++) {
            var trx_from = {
              'trx_from_address': '',
              //'trx_from_pub_key': '',
              //'trx_from_signature': '',
              'trx_from_amount': 0
            }
            trx_from.trx_from_address = decodeMinerAddress(substr(block_hex, CURRENT_OFFSET, OFFSET_ADDRESS).toString('hex'))
            trxs_from.address.push(trx_from.trx_from_address)
            CURRENT_OFFSET += OFFSET_ADDRESS

            // trx_from.trx_from_pub_key = substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_PUB_KEY).toString('hex')
            CURRENT_OFFSET += OFFSET_TRX_PUB_KEY
            // trx_from.trx_from_signature = substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_SIGN).toString('hex')
            CURRENT_OFFSET += OFFSET_TRX_SIGN
            trx_from.trx_from_amount = deserializeNumber8BytesBuffer(block_hex, CURRENT_OFFSET)
            trxs_from.amount += trx_from.trx_from_amount
            CURRENT_OFFSET += OFFSET_NUMBER
            trxs_from.trxs.push(trx_from)
          }
          var trx_from_currency_length = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_LENGTH))
          CURRENT_OFFSET += OFFSET_TRX_LENGTH
          // var trx_from_currency_token = substr(block_hex, CURRENT_OFFSET, trx_from_currency_length).toString('hex')
          CURRENT_OFFSET += trx_from_currency_length

          // Deserialize to trx data
          var trx_to_length = deserializeNumber(substr(block_hex, CURRENT_OFFSET, OFFSET_TRX_LENGTH))
          CURRENT_OFFSET += OFFSET_TRX_LENGTH

          var trxs_to = {
            'trxs': [],
            'address': [],
            'amount': 0
          }
          for (var to_address_index=0;to_address_index<trx_to_length; to_address_index++) {
            var trx_to = {
              'trx_to_address': '',
              'trx_to_amount': 0
            }

            trx_to.trx_to_address = decodeMinerAddress(substr(block_hex, CURRENT_OFFSET, OFFSET_ADDRESS).toString('hex'))
            trxs_to.address.push(trx_to.trx_to_address)
            CURRENT_OFFSET += OFFSET_ADDRESS

            trx_to.trx_to_amount = deserializeNumber8BytesBuffer(block_hex, CURRENT_OFFSET)
            trxs_to.amount += trx_to.trx_to_amount
            CURRENT_OFFSET += OFFSET_NUMBER
            trxs_to.trxs.push(trx_to)
          }

          var fee = (trxs_from.amount - trxs_to.amount) / amountDivider
          trxs_from.amount = trxs_from.amount / amountDivider
          trxs_to.amount = trxs_to.amount / amountDivider

          var trx = {
              //'version' : trx_version,
              //'nonce' : trx_nonce,
              //'time_lock' : trx_time_lock,
              //'from_length' : trx_from_length,
              'from': trxs_from,
              'to': trxs_to,
              'fee': fee,
              'block_id': block_id,
              'timestamp': human_timestamp.toUTCString()
          }
          trxs_container.push(trx)
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


exports.getTotalSupply = function(blockNumber) {
    var genesisSupply = 0
    var minedSupply = 0
    var totalSupply = 0

    if (blockNumber < 0) {
      return 0
    }

    if (blockNumber <= FIRST_BLOCK_REWARDS.length) {
        genesisSupply = FIRST_BLOCK_REWARDS.slice(0, blockNumber + 1).reduce(function(a, b) { return a + b; }, 0);
    } else {
      genesisSupply = FIRST_BLOCK_REWARDS.reduce(function(a, b) { return a + b; }, 0);
      minedSupply = (blockNumber - FIRST_BLOCK_REWARDS.length) * BASE_REWARD
    }
    totalSupply = genesisSupply + minedSupply
    return totalSupply
}
