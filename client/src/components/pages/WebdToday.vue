<template>
  <div class="blocks">
    <div v-if="status.result" class="webdToday transactionsWrapper">
      <h2> WEBD TODAY </h2>
      <span> LATEST BLOCK: </span> <span style="width: 70px!important;"> <router-link v-bind:to="{ name: 'Block', params: { block_id: status.last_block}}"> {{ status.last_block }} </router-link></span>
      <span> CURRENT SUPPLY: </span> <span style="width: 160px!important"> {{ formatMoneyNumber(status.current_supply) }} WEBD </span>
      <span> WEBD PRICE: </span> <span v-if="status.webd_price">{{ status.webd_price }} $</span>
      <span> MARKET CAP: </span> <span v-if="status.webd_price"> {{ formatMoneyNumber(status.current_supply * status.webd_price) }} $</span>
    </div>
    <div v-if="miners_loaded">
      <div v-if="miners.length != 0">
        <h2> Daily miners ({{this.miners_number}})</h2>
        <miners :page_number="this.miners_page_number" :miners="miners"></miners>
        <paginate v-if="this.miners && this.miners.length && this.miners_pages > 1" page="this.miners_page_number"
          :page-count="this.miners_pages" :click-handler="getLatestMiners" :prev-text="'Prev'"  :next-text="'Next'"
          :container-class="'pagination-wrapper pagination-wrapper-first'">
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

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
import StatusService from '@/services/StatusService'
import Transactions from '@/components/lists/Transactions.vue'
import Miners from '@/components/lists/Miners.vue'
import Loading from '@/components/utils/Loading'
import ExchangeService from '@/services/ExchangeService'

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
      miners_number: 0,
      status: {}
    }
  },
  mounted () {
    this.getLatestMiners()
    this.getLatestTransactions()
    this.getWebdInfo()
  },
  destroyed () {
    this.status = {}
  },
  methods: {
    formatMoneyNumber (number) {
      return Utils.formatMoneyNumber(number * 10000, 0)
    },
    async getWebdInfo () {
      let response = await StatusService.getStatus()
      this.status.result = true
      if (response.data && response.data.last_block) {
        this.status.result = true
        this.status.last_block = response.data.last_block
        this.status.current_supply = (4156801128 + (this.status.last_block - 40) * 6000)
        try {
          let valueUsd = await ExchangeService.fetchWebdValueCoinGeko('USD')
          this.status.webd_price = valueUsd.data.webdollar.usd
        } catch (ex) {
          console.log(ex)
        }
      }
    },

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
</style>
