<template>
  <div class="blocks">
    <div v-if="trxs_loaded">
      <div v-if="trxs.length != 0">
        <h2> Pending transactions </h2>
        <transactions :transactions="trxs" :address="no_addr"></transactions>
      </div>
      <h2 v-else> No pending transactions found. </h2>
    </div>
    <loading v-else></loading>
  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import Loading from '@/components/utils/Loading'

export default {
  name: 'pending_trx',

  components:{ Transactions, Loading },

  data () {
    return {
      trxs: [],
      trxs_loaded: false,
      no_addr: false
    }
  },
  mounted () {
    this.getPendingTransactions()
  },
  methods: {
    async getPendingTransactions() {
      this.trxs_loaded = false
      try {
        let response = await BlocksService.fetchPendingTransactions()
        if (response.data.trxs) {
          let trxs_parsed = []
          response.data.trxs.forEach(function(trx) {
            trx.from.addresses = trx.from.addresses.sort((a,b) => Number(b.amount) - Number(a.amount))
            trx.to.addresses = trx.to.addresses.sort((a,b) => Number(b.amount) - Number(a.amount))
            trxs_parsed.push(trx)
          })
          response.data.trxs = trxs_parsed
        }
        this.trxs= response.data.trxs
      } catch (exception) {
        console.error(exception)
        this.trxs = []
      }
      this.trxs_loaded = true
    },

  }
}
</script>
<style type="text/css">

  .result{
    display: block;
    padding: 10px 0;
  }

  .blockContainer{
    border:solid 1px #5f5f5f;
    text-align: center;
    width: 600px;
    margin: 0 auto;
  }

  .title{
    border-bottom:solid 1px #5f5f5f;
  }

  .textTitle{
    width: 100%;
    background-color: #3a3a3a;
    box-sizing: border-box;
    padding: 10px 0;
    display: block;
  }

</style>
