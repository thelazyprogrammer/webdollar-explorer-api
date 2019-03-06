import axios from 'axios'
require('axios-debug-log')

export default() => {
  return axios.create({
      baseURL: 'https://webd.pool.coffee:8443/pool/'
  })
}
