var config = {};

config.server = {};
config.webdollar = {};
config.couchdb = {};
config.couchdb.syncer = {};

config.server.port = 3000

config.webdollar.pouchdb_sync_url = "http://localhost:3333"
config.webdollar.couchdb_sync_url = "http://localhost:10000"

config.couchdb.host = "http://localhost:5984"
config.couchdb.db_name = 'blockjs'
config.couchdb.syncer.db_name = 'syncer'
config.couchdb.syncer.view_name = 'block'
config.couchdb.syncer.view_doc_name = 'ordered_blocks'


module.exports = config;
