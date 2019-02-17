import Api from '@/services/Api'
require('axios-debug-log')

export default {

  fetchBlocks (pageNumber) {
    if (!pageNumber) {
      pageNumber = 1
    }
    return Api().get('block?page_number=' + pageNumber)
  },

  fetchBlock (block_id) {
    return Api().get('block/' + block_id)
  },

  fetchMiner (miner_address, show_all_transactions) {
    let extraURLParams = '?show_all_transactions=false'
    if (show_all_transactions) {
      extraURLParams = '?show_all_transactions=true'
    }
    return Api().get('address/' + encodeURIComponent(miner_address) + extraURLParams)
  },

  fetchStars(star_url) {
    return Api().get('stars/' + star_url)
  },

  fetchPendingTransactions() {
    return  Api().get('pending_trx')
  },

  fetchLatestTransactions() {
    return  Api().get('latest_trx')
  },

  fetchLatestMiners() {
    return  Api().get('latest_miners')
  }
}
