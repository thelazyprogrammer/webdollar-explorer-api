var request = require('request')
var config = require('../../config')

exports.getSyncInfo = function (callback) {
  try {
    request.get(config.webdollar.pouchdb_sync_url + '/blocks/' + 1, function (error, response, body) {
      if (error) {
        console.error(error)
        console.error(body)
        callback()
      } else {
        try {
          var raw_blocks = JSON.parse(body).blocks
          callback(raw_blocks[0])
          return
        } catch (e) {
          console.log(e)
          callback()
        }
      }
    })
  } catch (e) {
    console.log(e)
    callback()
  }
}
