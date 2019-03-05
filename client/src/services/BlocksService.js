import Api from '@/services/Api'
require('axios-debug-log')

export default {

  fetchBlocks (pageNumber, miner_address, resolver_address) {
    if (!pageNumber) {
      pageNumber = 1
    }
    let extraURLParams = '?page_number=' + pageNumber
    if (miner_address) {
      extraURLParams += '&miner=' + encodeURIComponent(miner_address)
    }
    if (resolver_address) {
      extraURLParams += '&resolver=' + encodeURIComponent(resolver_address)
    }
    return Api().get('block' + extraURLParams)
  },

  fetchBlock (block_id) {
    return Api().get('block/' + block_id)
  },

  fetchMiner (miner_address, show_all_transactions, startDate, endDate) {
    let extraURLParams = '?show_all_transactions=false'
    if (show_all_transactions) {
      extraURLParams = '?show_all_transactions=true'
    }
    if (startDate && endDate) {
      extraURLParams += '&start_date=' + startDate + "&end_date=" + endDate
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
  },

  fetchTransactions(pageNumber, miner_address) {
    if (!pageNumber) {
      pageNumber = 1
    }
    let extraURLParams = '?page_number=' + pageNumber
    if (miner_address) {
      extraURLParams += '&miner=' + encodeURIComponent(miner_address)
    }
    return  Api().get('trx' + extraURLParams)
  },
}
