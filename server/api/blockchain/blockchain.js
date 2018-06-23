var atob = require('atob'),
  bs58 = require('bs58'),
  crypto = require('crypto'),
  request = require('request'),
  config = require('../../config'),
  blockchainDB = require('nano')(config.couchdb.host).use(config.couchdb.db_name);
  blockchainUtils = require('./utils');


exports.getSyncInfo = function (callback) {
  try {
    request.get(config.webdollar.couchdb_sync_url, function (error, response, body) {
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

