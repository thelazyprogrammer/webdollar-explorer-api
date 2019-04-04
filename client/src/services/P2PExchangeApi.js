import axios from 'axios'
require('axios-debug-log')

export default () => {
  return axios.create({
    baseURL: 'https://cors.io/?https://p2pb2b.io/api/v1/public/ticker'
  })
}
