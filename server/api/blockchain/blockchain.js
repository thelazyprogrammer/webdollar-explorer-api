var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  request = require('request'),
  blockchainDB = require('nano')('http://localhost:5984').use('blockjs');
  blockchainUtils = require('./utils');

var BLOCKCHAIN_STATUS_URL = 'http://localhost:10000'

exports.getSyncInfo = function (callback) {
  try {
    request.get(BLOCKCHAIN_STATUS_URL, function (error, response, body) {
      try {
        max_block_length = JSON.parse(body).blocks.length - 1
        blockchainDB.get('block' + max_block_length, {attachments:true, include_docs:true}, function (err, body) {
          if (err) {
            callback()
            return
          }
          var decodedBlock = blockchainUtils.decodeRawBlock(max_block_length, body._attachments.key.data)
          callback(decodedBlock)
        });
       } catch (e) {
         console.log(e)
         callback()
       }
    });
   } catch (e) {
     console.log(e)
     callback()
   }
}

