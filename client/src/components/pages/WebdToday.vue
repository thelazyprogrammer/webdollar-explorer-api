<template>
  <div class="blocks">
    <div v-if="miners_loaded">
      <div v-if="miners.length != 0">
        <h2> Top daily miners ({{this.miners_number}})</h2>
        <miners :page_number="this.miners_page_number" :miners="miners"></miners>
        <paginate v-if="this.miners && this.miners.length && this.miners_pages > 1" page="this.miners_page_number"
          :page-count="this.miners_pages" :click-handler="getLatestMiners" :prev-text="'Prev'"  :next-text="'Next'"
          :container-class="'pagination-wrapper pagination-wrapper-last'">
        </paginate>
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

import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import Miners from '@/components/lists/Miners.vue'
import Loading from '@/components/utils/Loading'

export default {
  name: 'webd_daily',

  components: { Miners, Transactions, Loading },

  data () {
    return {
      trxs: [],
      trxs_loaded: false,
      miners: [],
      miners_loaded: false,
      no_addr: false,
      miners_pages: 1,
      miners_page_number: 1,
      miners_number: 0
    }
  },
  mounted () {
    this.getLatestMiners()
    this.getLatestTransactions()
  },
  methods: {
    async getLatestTransactions () {
      this.trxs_loaded = false
      try {
        let response = await BlocksService.fetchLatestTransactions()
        this.trxs = response.data.trxs
      } catch (exception) {
        console.error(exception)
        this.trxs = []
      }
      this.trxs_loaded = true
    },
    async getLatestMiners (pageNumber) {
      this.miners_loaded = pageNumber || false
      try {
        let response = await BlocksService.fetchLatestMiners(pageNumber)
        this.miners = response.data.miners
        this.miners_page_number = response.data.page_number
        this.miners_pages = response.data.pages
        this.miners_number = response.data.miners_number
      } catch (exception) {
        console.error(exception)
        this.miners = []
      }
      this.miners_loaded = pageNumber || true
    }

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
