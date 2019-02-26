<template>
  <div class="blocks">
    <div v-if="miners_loaded">
      <div v-if="miners.length != 0">
        <h2> Top daily miners </h2>
        <miners :miners="miners"></miners>
      </div>
      <h2 v-else> No daily miners found </h2>
    </div>
    <loading v-else></loading>
    <div v-if="trxs_loaded">
      <div v-if="trxs.length != 0">
        <h2> Top daily transactions </h2>
        <transactions :transactions="trxs" :address="no_addr"></transactions>
      </div>
      <h2 v-else> No daily transactions found. </h2>
    </div>
    <loading v-else></loading>
  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import Miners from '@/components/lists/Miners.vue'
import Loading from '@/components/utils/Loading'

export default {
  name: 'webd_daily',

  components:{ Miners, Transactions, Loading },

  data () {
    return {
      trxs: [],
      trxs_loaded: false,
      miners: [],
      miners_loaded: false,
      no_addr: false
    }
  },
  mounted () {
    this.getLatestMiners()
    this.getLatestTransactions()
  },
  methods: {
    async getLatestTransactions() {
      this.trxs_loaded = false
      try {
        let response = await BlocksService.fetchLatestTransactions()
        this.trxs= response.data.trxs
      } catch (exception) {
        console.error(exception)
        this.trxs = []
      }
      this.trxs_loaded = true
    },
    async getLatestMiners() {
      this.miners_loaded = false
      try {
        let response = await BlocksService.fetchLatestMiners()
        this.miners = response.data.miners
      } catch (exception) {
        console.error(exception)
        this.miners = []
      }
      this.miners_loaded = true
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
