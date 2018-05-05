'use strict';

exports.list_all_blocks = function(req, res) {
  res.json([{ "block_id" : "1"}]);
};

exports.read_a_block = function(req, res) {
  res.json({ "block_id" : req.params.blockId});
};
