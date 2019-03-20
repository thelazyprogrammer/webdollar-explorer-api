import P2PExchangeApi from '@/services/P2PExchangeApi'

require('axios-debug-log')

export default {

  fetchWebdValue () {
    return P2PExchangeApi().get('')
  }

}
