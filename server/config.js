var config = {};

config.server = {};
config.webdollar = {};
config.couchdb = {};
config.couchdb.syncer = {};
config.mongodb = {};

config.server.port = process.env.SERVER_PORT || 3000

config.webdollar.pouchdb_sync_url = "http://localhost:3333"
config.webdollar.couchdb_sync_url = "http://localhost:3333"

config.couchdb.host = "http://localhost:5984"
config.couchdb.db_name = 'blockjs'
config.couchdb.syncer.db_name = 'syncer'
config.couchdb.syncer.view_name = 'block'
config.couchdb.syncer.view_doc_name = 'ordered_blocks'

config.enable_mongodb = true
config.mongodb.url = "mongodb://%2Ftmp%2Fmongodb-27017.sock"
config.mongodb.db = "blockchainDB3"
config.mongodb.collection = "blocks"
config.mongodb.uncle_collection = "uncles"
config.mongodb.trx_collection = "transactions"
config.mongodb.mtrx_collection = "mtransactions"

module.exports = config;
