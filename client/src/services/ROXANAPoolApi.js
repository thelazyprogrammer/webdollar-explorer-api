import axios from 'axios'
require('axios-debug-log')

export default () => {
  return axios.create({
    baseURL: 'https://webdollarpool.win:80/pools'
  })
}
