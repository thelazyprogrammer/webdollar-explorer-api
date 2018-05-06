'use strict';
module.exports = function(app) {
  var blockchain = require('../controllers/blockchainController');

  app.route('/block')
    .get(blockchain.list_all_blocks)

  app.route('/block/:blockId')
    .get(blockchain.read_a_block)
};
