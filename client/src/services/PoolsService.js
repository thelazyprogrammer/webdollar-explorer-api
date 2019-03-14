import WMPPoolApi from '@/services/WMPPoolApi'
import BACMPoolApi from '@/services/BACMPoolApi'
import COFFEEPoolApi from '@/services/COFFEEPoolApi'
import ROXANAPoolApi from '@/services/ROXANAPoolApi'

require('axios-debug-log')

export default {

  fetchPoolStatsWMP (miner) {
    return WMPPoolApi().get('miners')
  },

  fetchPoolStatsBACM (miner) {
    return BACMPoolApi().get('miners')
  },

  fetchPoolStatsROXANA (miner) {
    return ROXANAPoolApi().get('miners')
  },

  fetchPoolStatsCOFFEE (miner) {
    return COFFEEPoolApi().get()
  }
}
