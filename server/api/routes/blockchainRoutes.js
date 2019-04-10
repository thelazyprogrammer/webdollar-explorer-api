'use strict'
module.exports = function (app) {
  const blockchainMongo = require('../controllers/blockchainControllerMongo')
  const blockchainNative = require('../controllers/blockchainControllerNative')
  const statusController = require('../controllers/statusController')
  const config = require('../../config')

  let statusRoute = statusController.get_status_mongo
  let latestBlocksRoute = config.enable_mongodb ? blockchainMongo.latest_blocks_mongo : blockchainNative.latest_blocks
  let readAnAddressRoute = config.enable_mongodb ? blockchainMongo.read_an_address_mongo : blockchainNative.read_an_address
  let readABlockRoute = config.enable_mongodb ? blockchainMongo.read_a_block_mongo : blockchainNative.read_a_block

  app.route('/block')
    .get(latestBlocksRoute)

  app.route('/block/:blockId')
    .get(readABlockRoute)

  app.route('/address/:address*')
    .get(readAnAddressRoute)

  app.route('/status')
    .get(statusRoute)

  app.route('/stars/:address*')
    .get(blockchainMongo.get_stars)

  app.route('/pending_trx')
    .get(blockchainNative.get_pending_trx)

  app.route('/latest_trx')
    .get(blockchainMongo.get_latest_trx)

  app.route('/latest_miners')
    .get(blockchainMongo.get_latest_miners)

  app.route('/trx')
    .get(blockchainMongo.get_trx)

  app.route('/uncle')
    .get(blockchainMongo.get_uncle)
}
