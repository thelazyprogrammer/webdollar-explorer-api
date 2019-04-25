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

  app.route('/api/block')
    .get(latestBlocksRoute)

  app.route('/api/block/:blockId')
    .get(readABlockRoute)

  app.route('/api/address/:address*')
    .get(readAnAddressRoute)

  app.route('/api/status')
    .get(statusRoute)

  app.route('/api/current_supply')
    .get(statusController.get_current_supply)

  app.route('/api/total_supply')
    .get(statusController.get_total_supply)

  app.route('/api/stars/:address*')
    .get(blockchainMongo.get_stars)

  app.route('/api/pending_trx')
    .get(blockchainNative.get_pending_trx)

  app.route('/api/latest_trx')
    .get(blockchainMongo.get_latest_trx)

  app.route('/api/latest_miners')
    .get(blockchainMongo.get_latest_miners)

  app.route('/api/trx')
    .get(blockchainMongo.get_trx)

  app.route('/api/uncle')
    .get(blockchainMongo.get_uncle)

  app.route('/api/ts_items')
    .get(blockchainMongo.get_ts_items)
}

