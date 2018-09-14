'use strict';
var crypto = require('crypto');

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
