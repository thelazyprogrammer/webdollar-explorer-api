import WMPPoolApi from '@/services/WMPPoolApi'
import BACMPoolApi from '@/services/BACMPoolApi'
import COFFEEPoolApi from '@/services/COFFEEPoolApi'
require('axios-debug-log')

export default {

  fetchPoolStatsWMP (miner) {
    return WMPPoolApi().get('miners')
  },

  fetchPoolStatsBACM (miner) {
    return BACMPoolApi().get('miners')
  },

  fetchPoolStatsCOFFEE (miner) {
    return COFFEEPoolApi().get()
  },
}
