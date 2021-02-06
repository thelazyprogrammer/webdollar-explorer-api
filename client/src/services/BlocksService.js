import Api from '@/services/Api'
require('axios-debug-log')

function encodeURIComponentInternal (uri) {
  if (uri && uri.length === 40) {
    return encodeURIComponent(uri)
  }
  return uri
}

export default {

  fetchBlocks (pageNumber, minerAddress, resolverAddress) {
    if (!pageNumber) {
      pageNumber = 1
    }
    let extraURLParams = '?page_number=' + pageNumber
    if (minerAddress) {
      extraURLParams += '&miner=' + encodeURIComponentInternal(minerAddress)
    }
    if (resolverAddress) {
      extraURLParams += '&resolver=' + encodeURIComponentInternal(resolverAddress)
    }
    return Api().get('block' + extraURLParams)
  },

  fetchBlock (blockId) {
    return Api().get('block/' + blockId)
  },

  fetchBlockByTxSig (txSig) {
    return Api().get('block_tx_sig/' + txSig)
  },

  fetchMiner (minerAddress, showAllTransactions, startDate, endDate) {
    let extraURLParams = '?show_all_transactions=false'
    if (showAllTransactions) {
      extraURLParams = '?show_all_transactions=true'
    }
    if (startDate && endDate) {
      extraURLParams += '&start_date=' + startDate + '&end_date=' + endDate
    }
    return Api().get('address/' + encodeURIComponentInternal(minerAddress) + extraURLParams)
  },

  fetchStars (starUrl) {
    return Api().get('stars/' + starUrl)
  },

  fetchPendingTransactions () {
    return Api().get('pending_trx')
  },

  fetchLatestTransactions () {
    return Api().get('latest_trx')
  },

  fetchLatestMiners (pageNumber) {
    if (!pageNumber) {
      pageNumber = 1
    }
    let extraURLParams = '?page_number=' + pageNumber
    return Api().get('latest_miners' + extraURLParams)
  },

  fetchTransactions (pageNumber, minerAddress, isFrom, isTo, trxType, trxOrder, startDate, endDate) {
    if (!pageNumber) {
      pageNumber = 1
    }
    let extraURLParams = '?page_number=' + pageNumber
    if (minerAddress) {
      extraURLParams += '&miner=' + encodeURIComponentInternal(minerAddress)
    }
    if (isFrom) {
      extraURLParams += '&is_from=' + isFrom
    }
    if (isTo) {
      extraURLParams += '&is_to=' + isTo
    }
    if (trxType) {
      extraURLParams += '&trx_type=' + trxType
    }
    if (trxOrder) {
      extraURLParams += '&trx_order=' + trxOrder
    }
    if (startDate && endDate) {
      extraURLParams += '&start_date=' + startDate + '&end_date=' + endDate
    }

    return Api().get('trx' + extraURLParams)
  },

  fetchUncles () {
    return Api().get('uncle')
  },

  fetchTSItems (miner, type) {
    let extraURLParams = ''
    if (miner || type) {
      extraURLParams += '?&miner=' + encodeURIComponentInternal(miner) + '&type=' + type
    }
    return Api().get('ts_items' + extraURLParams)
  }
}
