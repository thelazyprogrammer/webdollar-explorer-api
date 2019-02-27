import Api from '@/services/Api'
require('axios-debug-log')

export default {

  getStatus () {
    return Api().get('status')
  }
}
