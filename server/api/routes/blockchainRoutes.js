'use strict';
module.exports = function(app) {
  var blockchain = require('../controllers/blockchainController');
  var statusController = require('../controllers/statusController');

  app.route('/block')
    .get(blockchain.list_all_blocks)

  app.route('/block/:blockId')
    .get(blockchain.read_a_block)

  app.route('/address/:address*')
    .get(blockchain.read_an_address)

  app.route('/status')
    .get(statusController.get_status)

  app.route('/stars/:address*')
    .get(blockchain.get_stars)

  app.route('/pending_trx')
    .get(blockchain.get_pending_trx)
};
