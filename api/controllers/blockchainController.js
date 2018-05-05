'use strict';
var atob = require('atob'),
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

exports.read_a_block = function(req, res) {
  var blockId = 'block' + parseInt(req.params.blockId);
  BlockchainDB.get(blockId, {attachments:true, include_docs:true}, function (err, body) {
    if (!(body)) {
       res.status(404).send('Not found');
    } else {
      var  block_raw = body._attachments.key.data
      var block_hex = Buffer.from(atob(Buffer.from(block_raw, 'base64')), "hex")
      var block_hash = substr(block_hex, 0, 32).toString('hex')
      var block_nonce = deserializeNumber(substr(block_hex, 32, 4))
      var block_version = deserializeNumber(substr(block_hex, 36, 2))
      var block_hashPrev = substr(block_hex, 38, 32).toString('hex')
      var block_timestamp = deserializeNumber(substr(block_hex, 70, 4)) + 1524742312
      var human_timestamp = new Date(block_timestamp * 1000)

      res.json({
        'id' : body._id.replace('block',''),
        'hash' : block_hash,
        'nonce' : block_nonce,
        'version' : block_version,
        'previous_hash' : block_hashPrev,
        'timestamp' : human_timestamp
        //'block_hex' : block_hex.toString('hex'),
        //'block_raw' : block_raw
        });
      }
    })
};
