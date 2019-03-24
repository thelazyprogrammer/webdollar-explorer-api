<template>
  <div class="blocks">
    <h2> Transactions ({{ this.trxs_number }})</h2>
    <div class="transactionsWrapper">
      <label for="address_input"> Address </label>
      <input style="width:27em" id="address_input" type="text" v-model="address" v-on:input="getTransactionsAddress">
      <label for="address_type"> Direction </label>
      <select id="address_type" v-model="address_type" v-on:change="getTransactionsAddress">
        <option>Any</option>
        <option>OnlyFrom</option>
        <option>OnlyTo</option>
      </select>
    </div>
    <div align="center" style="padding: 0.1em;">
      <label for="trx_type"> Type </label>
      <select id="trx_type" v-model="trx_type" v-on:change="getTransactionsAddress">
        <option>Any</option>
        <option>SISO</option>
        <option>SIMO</option>
        <option>MISO</option>
        <option>MIMO</option>
      </select>
      <label for="trx_order"> Order </label>
      <select id="trx_order" v-model="trx_order" v-on:change="getTransactionsAddress">
        <option>DateDesc</option>
        <option>DateAsc</option>
        <option>ValueDesc</option>
        <option>ValueAsc</option>
        <option>FeeDesc</option>
        <option>FeeAsc</option>
      </select>
    </div>
     <div class="sliderWrapper" style="width: 680px; margin: 2em auto 02em;">
         <vue-slider @drag-end="onTimeIntervalChange" :tooltipDir.sync="tooltipDir" :piecewise.sync="piecewise" :data.sync="data" :value.sync="value"></vue-slider>
     </div>
    <div v-if="trxs_loaded">
      <div v-if="trxs.length != 0">

        <div class="addressTab transactionsWrapper" id="transactions_all">
          <paginate v-if="this.trxs && this.trxs.length && this.pages > 1" page="this.page_number"
            :page-count="this.pages" :click-handler="getTransactions" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper pagination-wrapper-first'">
          </paginate>
          <transactions :transactions="this.trxs" :address="no_addr"></transactions>
          <paginate v-if="this.trxs && this.trxs.length && this.pages > 1" page="this.page_number"
            :page-count="this.pages" :click-handler="getTransactions" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper pagination-wrapper-last'">
          </paginate>
        </div>
      </div>
      <h2 v-else> No transactions found. </h2>
    </div>
    <loading v-else></loading>
  </div>

</template>

<script>
/* eslint-disable no-unmodified-loop-condition */

import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import Loading from '@/components/utils/Loading'

export default {
  name: 'trxs',

  components: { Transactions, Loading },

  data () {
    return {
      trxs: [],
      address: '',
      prev_address: '',
      address_type: 'Any',
      prev_address_type: 'Any',
      trx_type: 'Any',
      trx_address_type: 'Any',
      trx_order: 'DateDesc',
      prev_trx_order: 'DateDesc',
      trxs_loaded: false,
      trxs_number: 0,
      date_from: '2019-02-25',
      date_to: '2019-04-25',
      no_addr: false,
      pages: 0,
      page_number: 1,
      is_to: false,
      is_from: false,
      piecewise: false,
      startDate: false,
      endDate: false,
      tooltipDir: ['top', 'bottom'],
      data: [],
      value: []
    }
  },
  mounted () {
    this.data = this.getDates()
    this.value = this.getStartEndDates()
    this.getTransactions()
  },
  methods: {
    async onTimeIntervalChange (el) {
      let intervals = el.getValue()

      this.startDate = intervals[0]
      this.endDate = intervals[1]
      this.getTransactions()
    },
    getStartEndDates () {
      let days = this.getDates()
      if (this.startDate && this.endDate) {
        return [this.startDate, this.endDate]
      }
      return [days[0], days[days.length - 1]]
    },
    getDates () {
      let days = []
      let start = new Date(1524743407 * 1000)
      let end = new Date()
      let currDay = new Date(start)
      while (end >= start) {
        currDay = new Date(start)
        days.push(currDay.toISOString().split('T')[0])
        start.setDate(start.getDate() + 1)
      }
      currDay = new Date(start)
      days.push(currDay.toISOString().split('T')[0])
      return days
    },
    async getTransactionsAddress (valueChanged) {
      let isChanged = false
      if ((this.prev_address !== this.address && this.address.length === 40) || !this.address) {
        this.prev_address = this.address
        isChanged = true
      }
      if (this.address_type !== this.prev_address_type) {
        this.prev_address_type = this.address_type
        isChanged = true
        if (this.address_type === 'Any') {
          this.is_from = false
          this.is_to = false
        }
        if (this.address_type === 'OnlyFrom') {
          this.is_from = true
          this.is_to = false
        }
        if (this.address_type === 'OnlyTo') {
          this.is_to = true
          this.is_from = false
        }
      }

      if (this.trx_type !== this.prev_trx_type) {
        this.prev_trx_type = this.trx_type
        isChanged = true
      }

      if (this.trx_order !== this.prev_trx_order) {
        this.prev_trx_order = this.trx_order
        isChanged = true
      }

      if (isChanged) {
        this.page_number = 1
        this.getTransactions()
      }
    },
    async getTransactions (pageNumber) {
      this.data = this.getDates()
      this.value = this.getStartEndDates()
      try {
        if (pageNumber) {
          this.page_number = pageNumber
        }
        let response = await BlocksService.fetchTransactions(this.page_number, this.address,
          this.is_from, this.is_to, this.trx_type, this.trx_order, this.startDate, this.endDate)
        this.trxs = response.data.trxs
        this.pages = response.data.pages
        this.page_number = response.data.page_number
        this.trxs_number = response.data.trxs_number
      } catch (exception) {
        console.error(exception)
        this.trxs = []
        this.pages = 0
        this.page_number = 1
        this.trxs_number = 0
      }
      this.trxs_loaded = true
    }

  }
}
</script>

<style type="text/css">
</style>
