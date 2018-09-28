'use strict';
module.exports = function(app) {
  const blockchain = require('../controllers/blockchainController');
  const statusController = require('../controllers/statusController');
  const config = require('../../config');

  let status_route = config.enable_mongodb ? statusController.get_status_mongo: statusController.get_status
  let latest_blocks_route = config.enable_mongodb ? blockchain.latest_blocks_mongo : blockchain.latest_blocks

  app.route('/block')
    .get(latest_blocks_route)

  app.route('/block/:blockId')
    .get(blockchain.read_a_block)

  app.route('/address/:address*')
    .get(blockchain.read_an_address)

  app.route('/status')
    .get(status_route)

  app.route('/stars/:address*')
    .get(blockchain.get_stars)

  app.route('/pending_trx')
    .get(blockchain.get_pending_trx)
};
