import axios from 'axios'
require('axios-debug-log')

export default() => {
  return axios.create({
    baseURL: 'http://209.250.248.110:30001'
  })
}
