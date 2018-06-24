let request = require('request')
let blockchain = require('../blockchain/blockchain');

// if the current block is older than MAX_SYNC_OFFSET seconds,
// then the explorer is unsynced
let MAX_SYNC_OFFSET = 600 * 1000


exports.get_status = function(req, res) {
  let lastBlockInfo = blockchain.getSyncInfo(function (block) {
    res.header("Access-Control-Allow-Origin", "*");
    if (!block) {
      res.json({})
      return
    }
    let is_synchronized = false
    let currentTimestamp = new Date().getTime()
    let date = new Date((block.raw_timestamp + 1524742312) * 1000)
    let blockTimestamp = date.getTime()
    if (currentTimestamp - blockTimestamp < MAX_SYNC_OFFSET) {
      is_synchronized = true
    }
    let statusResult = {
      is_synchronized : is_synchronized,
      current_timestamp : currentTimestamp,
      block_timestamp : blockTimestamp,
      last_block : block.id
    }
    res.json(statusResult)
  });
}
