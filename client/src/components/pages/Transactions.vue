<template>
  <div class="blocks">
    <h2> Transactions ({{ this.trxs_number }})</h2>
    <div align="center">
      <label for="address_input"> Address </label>
      <input style="width:27em" id="address_input" type="text" v-model="address" v-on:input="getTransactionsAddress">
      <label for="address_type"> Direction </label>
      <select id="address_type" v-model="address_type" v-on:change="getTransactionsAddress">
        <option>Any</option>
        <option>OnlyFrom</option>
        <option>OnlyTo</option>
      </select>
    </div>
    <div v-if="trxs_loaded">
      <div v-if="trxs.length != 0">

        <div class="addressTab transactionsWrapper" id="transactions_all">
          <paginate v-if="this.trxs && this.trxs.length && this.pages > 1" page="this.page_number"
            :page-count="this.pages" :click-handler="getTransactions" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper'">
          </paginate>
          <transactions :transactions="this.trxs" :address="no_addr"></transactions>
          <paginate v-if="this.trxs && this.trxs.length && this.pages > 1" page="this.page_number"
            :page-count="this.pages" :click-handler="getTransactions" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper'">
          </paginate>
        </div>
      </div>
      <h2 v-else> No transactions found. </h2>
    </div>
    <loading v-else></loading>
  </div>

</template>

<script>

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
      address_type: '',
      prev_address_type: '',
      trxs_loaded: false,
      trxs_number: 0,
      no_addr: false,
      pages: 0,
      page_number: 1,
      is_to: false,
      is_from: false
    }
  },
  mounted () {
    this.getTransactions()
  },
  methods: {
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
      if (isChanged) {
        this.page_number = 1
        this.getTransactions()
      }
    },
    async getTransactions (pageNumber) {
      try {
        if (pageNumber) {
          this.page_number = pageNumber
        }
        let response = await BlocksService.fetchTransactions(this.page_number, this.address, this.is_from, this.is_to)
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
