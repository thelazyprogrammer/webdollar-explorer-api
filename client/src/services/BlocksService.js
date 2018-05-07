import Api from '@/services/Api'
require('axios-debug-log')

export default {
  fetchBlocks () {
    return Api().get('block')
  },
  fetchBlock (block_id) {
    return Api().get('block/' + block_id)
  }
}
