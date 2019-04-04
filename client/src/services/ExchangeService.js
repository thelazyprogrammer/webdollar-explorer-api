import P2PExchangeApi from '@/services/P2PExchangeApi'
import CoinGekoApi from '@/services/CoinGekoApi'

require('axios-debug-log')

export default {

  fetchWebdValue (currency) {
    return P2PExchangeApi().get('?market=WEBD_' + currency)
  },

  fetchWebdValueCoinGeko (currency) {
    return CoinGekoApi().get('simple/price?ids=webdollar&vs_currencies=' + currency)
  }
}
