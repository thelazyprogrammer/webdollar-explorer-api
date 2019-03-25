import axios from 'axios'
require('axios-debug-log')

export default () => {
  return axios.create({
    baseURL: 'https://api.coingecko.com/api/v3/',
    headers: {}
  })
}
