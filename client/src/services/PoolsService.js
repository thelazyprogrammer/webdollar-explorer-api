import axios from 'axios'
require('axios-debug-log')

const POOL_API = {
  'WMP-ASIA': 'https://singapore.webdollarminingpool.com/pools/miners',
  'WMP': 'https://server.webdollarminingpool.com/pools/miners',
  'Roxana': 'https://webdollarpool.win:80/pools/miners',
  'BACMpool': 'https://pool.bacm.ro/pools/miners',
  'BACM': 'https://pool.bacm.ro:8443/pools/miners',
  '2MooNPooL': 'https://2moonpool.ddns.net:3335/pools/miners',
  'EuroPool': 'https://webd-europool.ddns.net:2222/pools/miners',
  'CoffeePool': 'https://webd.pool.coffee:8443/pool'
}

function getAxiosWrapper (poolApi) {
  return axios.create({
    baseURL: poolApi
  })
}

export default {
  fetchPoolStats (pool) {
    return getAxiosWrapper(POOL_API[pool]).get()
  }
}
