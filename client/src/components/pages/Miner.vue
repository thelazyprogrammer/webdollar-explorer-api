<template>
  <div class="blocks">

    <div id="address" v-if="miner && miner.address" class="table-wrap">

     <miner-info :estimated_value="this.estimated_value" :estimated_value_usd="this.estimated_value_usd" :miner="this.miner"></miner-info>
     <div class="sliderWrapper">
         <vue-slider @drag-end="onTimeIntervalChange" :tooltipDir.sync="tooltipDir" :piecewise.sync="piecewise" :data.sync="data" :value.sync="value"></vue-slider>
     </div>
     <div :class="miner.transactions.length === 0 || miner.blocks.length === 0 ? 'minedBlocksAndTransactionsRevert' : '' ">

        <div class="tabWrapper">
          <button id="button_trx" v-if="miner.transactions_number" class="w3-bar-item w3-button" v-on:click="openTab('transactions')">Transactions <br> ({{ getTrxNumber(miner.transactions_number, miner.transactions.length)}})</button>
          <button id="button_block" v-if="miner.blocks_number" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('blocks')">Mined Blocks <br> ({{ getTrxNumber(miner.blocks_number, miner.blocks.length)}})</button>
          <button id="button_block_resolved" v-if="this.blocksr_number" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('blocks_resolved')">Resolved Blocks <br> ({{ getTrxNumber(this.blocksr_number, this.blocksr.length)}})</button>
          <button id="button_pools_stats" v-if="this.poolStats.length > 0" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('pool_stats')">Live Pool Stats<br>({{ this.poolStats.length }})</button>
          <button id="button_pools_miners" v-if="this.pool_miners.length > 0" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('pool_miners')">Live Pool Miners<br> ({{ this.pool_miners.length }})</button>
          <button id="button_miner_analytics" v-if="this.chart_options && this.chart_options.chart" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('miner_analytics')">Analytics</button>
        </div>

        <div class="addressTab transactionsWrapper" id="transactions">
          <transactions :address="this.miner.address" :transactions="this.miner.transactions"></transactions>
          <paginate v-if="this.miner.transactions && this.miner.transactions.length && this.miner.transactions.pages > 1" page="this.miner.transactions.page_number"
            :page-count="this.miner.transactions.pages" :click-handler="changeTransactions" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper'">
          </paginate>
        </div>

        <div class="addressTab transactionsWrapper" id="blocks">
          <light-blocks :showMiner="false" :showResolver="true" :blocks="this.miner.blocks"></light-blocks>
          <paginate v-if="this.miner.blocks && this.miner.blocks.length && this.miner.blocks.pages > 1" page="this.miner.blocks.page_number"
            :page-count="this.miner.blocks.pages" :click-handler="changeBlocks" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper'">
          </paginate>
        </div>

        <div class="addressTab transactionsWrapper" id="blocks_resolved">
          <light-blocks :showMiner="true" :blocks="this.blocksr"></light-blocks>
          <paginate v-if="this.blocksr && this.blocksr.length && this.blocksr.pages > 1" page="this.blocksr.page_number"
            :page-count="this.blocksr.pages" :click-handler="changeBlocksResolved" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper'">
          </paginate>
        </div>

        <div class="addressTab transactionsWrapper" id="pools_stats">
          <pool-stats :stats="this.poolStats"></pool-stats>
        </div>

        <div id="pools_miners">
          <pool-live-miners :page_number="1" :miners="this.pool_miners"></pool-live-miners>
        </div>

        <analytics class="addressTab transactionsWrapper" id="miner_analytics" v-if="this.chart_options && this.chart_options.chart" :chart_options="this.chart_options"></analytics>
      </div>

    </div>

    <loading v-else></loading>

  </div>
</template>

<script>
/* eslint-disable no-unmodified-loop-condition */

import Utils from '@/services/utils'
import SpecialAddresses from '@/services/SpecialAddresses'
import BlocksService from '@/services/BlocksService'
import PoolsService from '@/services/PoolsService'
import ExchangeService from '@/services/ExchangeService'
import Transactions from '@/components/lists/Transactions.vue'
import MinerInfo from '@/components/infoComponents/MinerInfo.vue'
import Analytics from '@/components/infoComponents/Analytics.vue'
import LightBlocks from '@/components/lists/LightMinedBlocks.vue'
import PoolStats from '@/components/lists/PoolStats.vue'
import PoolLiveMiners from '@/components/lists/PoolLiveMiners.vue'
import Loading from '@/components/utils/Loading'
import vueSlider from 'vue-slider-component'
export default {

  components: { vueSlider, Transactions, MinerInfo, LightBlocks, Loading, PoolStats, PoolLiveMiners, Analytics },

  name: 'miner',

  data () {
    return {
      showLatestTransactions: true,
      showMiner: 'doNotShowClass',
      showTransactions: 'showClass',
      miner: { default: function () { return { } } },
      estimated_value: 0,
      estimated_value_usd: 0,
      blocksr: { default: function () { return { } } },
      searchAddress: '',
      searchStart: '',
      piecewise: false,
      startDate: false,
      blocksr_number: 0,
      endDate: false,
      tooltipDir: ['top', 'bottom'],
      data: { default: function () { return this.getDates() } },
      value: { default: function () { return this.getStartEndDates() } },
      poolStats: [],
      pool_miners: [],
      chart_options: {}
    }
  },
  async beforeRouteUpdate (to) {
    this.getMiner()
  },

  destroyed () {
    this.miner = {}
    this.poolStats = []
    this.pool_miners = []
    this.chart_options = {}
  },

  mounted () {
    this.miner = {}
    this.poolStats = []
    this.pool_miners = []
    this.chart_options = {}
    this.getMiner(window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length))
  },

  methods: {
    async onTimeIntervalChange (el) {
      let intervals = el.getValue()

      this.startDate = intervals[0]
      this.endDate = intervals[1]
      this.value = [this.startDate, this.endDate]
      this.getMiner(window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length), this.startDate, this.endDate)
      this.value = [this.startDate, this.endDate]
    },
    async changeBlocks (pageNum) {
      let miner = window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length)
      let blocks = await BlocksService.fetchBlocks(pageNum, miner)
      this.miner.blocks = blocks.data.blocks
      this.miner.blocks_number = blocks.data.blocks_number
      this.miner.blocks.pages = blocks.data.pages
      this.miner.blocks.page_number = blocks.data.page_number
    },
    async changeBlocksResolved (pageNum) {
      let miner = window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length)
      let blocksResolved = await BlocksService.fetchBlocks(pageNum, '', miner)
      this.blocksr = blocksResolved.data.blocks
      this.blocksr_number = blocksResolved.data.blocks_number
      this.blocksr.pages = blocksResolved.data.pages
      this.blocksr.page_number = blocksResolved.data.page_number
    },
    async changeTransactions (pageNum) {
      let miner = window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length)
      let transactions = await BlocksService.fetchTransactions(pageNum, miner)
      this.miner.transactions = this.orderTrx(transactions, miner)
      this.miner.transactions_number = transactions.data.trxs_number
      this.miner.transactions.pages = transactions.data.pages
      this.miner.transactions.page_number = transactions.data.page_number
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
      if (this.miner.first_block_timestamp) {
        start = new Date(this.miner.first_block_timestamp * 1000)
      }
      if (this.miner.last_block_timestamp) {
        end = new Date((this.miner.last_block_timestamp + 24 * 3600) * 1000)
      }
      let currDay = new Date(start)
      while (start < end) {
        currDay = new Date(start)
        days.push(currDay.toISOString().split('T')[0])
        start.setDate(start.getDate() + 1)
      }
      currDay = new Date(start)
      days.push(currDay.toISOString().split('T')[0])
      return days
    },
    getTrxNumber (allTrxNumber, trxReceivedNumber) {
      if (parseInt(trxReceivedNumber) >= parseInt(allTrxNumber)) {
        return trxReceivedNumber
      } else {
        return 'latest ' + trxReceivedNumber + ' from ' + allTrxNumber
      }
    },
    orderTrx (transactions, miner) {
      if (transactions) {
        let trxsParsed = []
        var minerAddress = miner
        transactions.data.trxs.forEach(function (trx) {
          if (trx.block_number) {
            var indexFrom = -1
            var indexTo = -1

            trx.from.trxs = trx.from.trxs.sort(function (a, b) {
              return (Number(b.trx_from_amount) - Number(a.trx_from_amount))
            })
            trx.from.trxs.forEach(function (trx, index) {
              if (trx.trx_from_address === minerAddress) {
                indexFrom = index
              }
            })

            if (indexFrom !== -1) {
              trx.from.trxs.unshift(trx.from.trxs[indexFrom])
              trx.from.trxs.splice(indexFrom + 1, 1)
            }

            trx.to.trxs = trx.to.trxs.sort(function (a, b) {
              return (Number(b.trx_to_amount) - Number(a.trx_to_amount))
            })
            trx.to.trxs.forEach(function (trx, index) {
              if (trx.trx_to_address === minerAddress) {
                indexTo = index
              }
            })
            if (indexTo !== -1) {
              trx.to.trxs.unshift(trx.to.trxs[indexTo])
              trx.to.trxs.splice(indexTo + 1, 1)
            }
          } else {
            trx.block_number = 'pending'
          }

          trxsParsed.push(trx)
        })
        return trxsParsed
      }
      return []
    },

    async getWebdValue () {
      if (this.estimated_value && this.estimated_value_usd) {
        return
      }

      try {
        let valueUsd = await ExchangeService.fetchWebdValueCoinGeko('USD')
        this.estimated_value_usd = valueUsd.data.webdollar.usd
      } catch (ex) {
        console.log(ex)
      }

      try {
        let valueEth = await ExchangeService.fetchWebdValueCoinGeko('ETH')
        this.estimated_value = valueEth.data.webdollar.eth
      } catch (ex) {
        console.log(ex)
      }
    },

    async getMiner (miner, startDate, endDate) {
      this.miner = {}
      this.poolStats = []
      this.pool_miners = []

      this.getWebdValue()

      miner = window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length)
      let minerTask = BlocksService.fetchMiner(miner, !this.showLatestTransactions, startDate, endDate)
      let blocksTask = BlocksService.fetchBlocks(1, miner)
      let blocksResolvedTask = BlocksService.fetchBlocks(1, '', miner)
      let transactionsTask = BlocksService.fetchTransactions(1, miner)
      let blockTSTask = BlocksService.fetchTSItems(miner, 'blocks')
      let trxTSTask = BlocksService.fetchTSItems(miner, 'trxs')
      let amountReceivedTSTask = BlocksService.fetchTSItems(miner, 'amount_received')
      let amountSentTSTask = BlocksService.fetchTSItems(miner, 'amount_sent')

      let blockData = await blockTSTask
      let trxData = await trxTSTask
      let amountReceived = await amountReceivedTSTask
      let amountSent = await amountSentTSTask

      let blocks = await blocksTask
      let blocksResolved = await blocksResolvedTask
      let transactions = await transactionsTask
      let minerData = await minerTask
      this.miner = minerData.data

      let chartOptions = Utils.getChartOptions()
      chartOptions.series[2].data = blockData.data
      chartOptions.series[3].data = trxData.data
      chartOptions.series[0].data = amountReceived.data
      chartOptions.series[1].data = amountSent.data
      this.chart_options = chartOptions

      this.miner.transactions = this.orderTrx(transactions, miner)

      this.miner.transactions_number = transactions.data.trxs_number
      this.miner.transactions.pages = transactions.data.pages
      this.miner.transactions.page_number = transactions.data.page_number
      this.miner.blocks = blocks.data.blocks
      this.miner.blocks_number = blocks.data.blocks_number
      this.miner.blocks.pages = blocks.data.pages
      this.blocksr = blocksResolved.data.blocks
      this.blocksr_number = blocksResolved.data.blocks_number
      this.blocksr.pages = blocksResolved.data.pages
      this.blocksr.page_number = blocksResolved.data.page_number
      this.data = this.getDates()
      this.value = this.getStartEndDates()
      var self = this
      setTimeout(function () {
        if (!self.miner.transactions_number || self.miner.transactions_number === 0) {
          if (self.miner.blocks_number && self.miner.blocks_number !== 0) {
            self.openTab('blocks')
          }
        } else {
          self.openTab('transactions')
        }
      }, 1)

      let poolStats = []
      let pools = SpecialAddresses.pools.filter((a) => { return a.status === 'up' })
      let isPool = pools.filter((a) => { return a.address === miner })
      if (isPool && isPool.length) pools = isPool
      pools = pools.sort((a, b) => { return a.level - b.level })
      for (let p = 0; p < pools.length; p++) {
        let pool = pools[p]
        try {
          poolStats = await PoolsService.fetchPoolStats(pool.name)
          let poolMiners = []
          if (poolStats.data && poolStats.data.miners) {
            poolMiners = poolStats.data.miners
          } else {
            poolMiners = poolStats.data
          }
          let minerNumber = 0
          let minerPool = {}
          let hashes = 0
          for (var minerIndex = 0; minerIndex < poolMiners.length; minerIndex++) {
            if (poolMiners[minerIndex].address === miner) {
              minerPool = poolMiners[minerIndex]
              if (minerPool.hashes_alt) {
                hashes += minerPool.hashes_alt
              } else {
                hashes = minerPool.hps
                minerPool.power = minerPool.hps
                minerPool.reward_sent = minerPool.total_sent * 10000
                minerPool.reward_total = minerPool.reward_total * 10000
              }
              minerNumber++
            }
          }
          if (minerNumber > 0) {
            minerPool.address = pool.address
            minerPool.miners = minerNumber
            minerPool.power = hashes
            this.poolStats.push(minerPool)
          }
          if (miner === pool.address) {
            let aggregateMiner = {
              miner_ip: 'all',
              reward_confirmed: 0,
              totalPOSBalance: 0,
              hashes_alt: 0,
              address: miner
            }
            let uniqueMiners = []
            let mappedMiners = {}
            for (let mIndex = 0; mIndex < poolMiners.length; mIndex++) {
              let m = poolMiners[mIndex]
              let uniqueMiner = false
              if (!mappedMiners[m.address]) {
                mappedMiners[m.address] = m
                uniqueMiner = true
              }
              m.reward_confirmed = m.reward_total
              if (m.reward_confirmed) aggregateMiner.reward_confirmed += m.reward_confirmed
              if (m.stakeBalance) m.totalPOSBalance = Number(m.stakeBalance)
              if (m.totalPOSBalance && uniqueMiner) {
                aggregateMiner.totalPOSBalance += m.totalPOSBalance
              }
              if (m.hps) {
                m.hashes_alt = m.hps
              }
              if (m.hashes_alt) {
                aggregateMiner.hashes_alt += m.hashes_alt
              }
              if (m.hashes && !m.hashes_alt) {
                aggregateMiner.hashes_alt += m.hashes
              }
            }
            Object.keys(mappedMiners).forEach(function (key) {
              uniqueMiners.push(mappedMiners[key])
            })
            uniqueMiners.push(aggregateMiner)
            this.pool_miners = uniqueMiners.sort((c, d) => {
              let a = Number(c.totalPOSBalance)
              let b = Number(d.totalPOSBalance)
              if (isNaN(a)) a = 0
              if (isNaN(b)) b = 0
              return b - a
            })
          }
        } catch (ex) {
          console.log(ex)
        }
      }
    },

    formatMoneyNumber (number, decimals) {
      return Utils.formatMoneyNumber(number, decimals)
    },

    openTab (name) {
      if (name === 'blocks') {
        Utils.setDisplay('blocks', 'block')
        Utils.setDisplay('transactions', 'none')
        Utils.setDisplay('blocks_resolved', 'none')
        Utils.setDisplay('pools_stats', 'none')
        Utils.setColor('button_pools_stats', '#a4c0ab')
        Utils.setColor('button_block', '#00c02c')
        Utils.setColor('button_trx', '#a4c0ab')
        Utils.setColor('button_block_resolved', '#a4c0ab')
        Utils.setColor('button_pools_miners', '#a4c0ab')
        Utils.setDisplay('pools_miners', 'none')
        Utils.setColor('button_miner_analytics', '#a4c0ab')
        Utils.setDisplay('miner_analytics', 'none')
      } else if (name === 'blocks_resolved') {
        Utils.setDisplay('blocks', 'none')
        Utils.setDisplay('transactions', 'none')
        Utils.setDisplay('blocks_resolved', 'block')
        Utils.setDisplay('pools_stats', 'none')
        Utils.setColor('button_pools_stats', '#a4c0ab')
        Utils.setColor('button_block', '#a4c0ab')
        Utils.setColor('button_trx', '#a4c0ab')
        Utils.setColor('button_block_resolved', '#00c02c')
        Utils.setColor('button_pools_miners', '#a4c0ab')
        Utils.setDisplay('pools_miners', 'none')
        Utils.setColor('button_miner_analytics', '#a4c0ab')
        Utils.setDisplay('miner_analytics', 'none')
      } else if (name === 'pool_stats') {
        Utils.setDisplay('blocks', 'none')
        Utils.setDisplay('transactions', 'none')
        Utils.setDisplay('blocks_resolved', 'none')
        Utils.setDisplay('pools_stats', 'block')
        Utils.setColor('button_block', '#a4c0ab')
        Utils.setColor('button_trx', '#a4c0ab')
        Utils.setColor('button_block_resolved', '#a4c0ab')
        Utils.setColor('button_pools_stats', '#00c02c')
        Utils.setColor('button_pools_miners', '#a4c0ab')
        Utils.setDisplay('pools_miners', 'none')
        Utils.setColor('button_miner_analytics', '#a4c0ab')
        Utils.setDisplay('miner_analytics', 'none')
      } else if (name === 'pool_miners') {
        Utils.setDisplay('blocks', 'none')
        Utils.setDisplay('transactions', 'none')
        Utils.setDisplay('blocks_resolved', 'none')
        Utils.setDisplay('pools_stats', 'none')
        Utils.setDisplay('pools_miners', 'block')
        Utils.setColor('button_block', '#a4c0ab')
        Utils.setColor('button_trx', '#a4c0ab')
        Utils.setColor('button_block_resolved', '#a4c0ab')
        Utils.setColor('button_pools_stats', '#a4c0ab')
        Utils.setColor('button_pools_miners', '#00c02c')
        Utils.setColor('button_miner_analytics', '#a4c0ab')
        Utils.setDisplay('miner_analytics', 'none')
      } else if (name === 'miner_analytics') {
        Utils.setDisplay('blocks', 'none')
        Utils.setDisplay('transactions', 'none')
        Utils.setDisplay('blocks_resolved', 'none')
        Utils.setDisplay('pools_stats', 'none')
        Utils.setDisplay('pools_miners', 'none')
        Utils.setColor('button_block', '#a4c0ab')
        Utils.setColor('button_trx', '#a4c0ab')
        Utils.setColor('button_block_resolved', '#a4c0ab')
        Utils.setColor('button_pools_stats', '#a4c0ab')
        Utils.setColor('button_pools_miners', '#a4c0ab')
        Utils.setColor('button_miner_analytics', '#00c02c')
        Utils.setDisplay('miner_analytics', 'block')
      } else {
        Utils.setDisplay('blocks', 'none')
        Utils.setDisplay('transactions', 'block')
        Utils.setDisplay('blocks_resolved', 'none')
        Utils.setDisplay('pools_stats', 'none')
        Utils.setColor('button_pools_stats', '#a4c0ab')
        Utils.setColor('button_block', '#a4c0ab')
        Utils.setColor('button_trx', '#00c02c')
        Utils.setColor('button_block_resolved', '#a4c0ab')
        Utils.setColor('button_pools_miners', '#a4c0ab')
        Utils.setDisplay('pools_miners', 'none')
        Utils.setColor('button_miner_analytics', '#a4c0ab')
        Utils.setDisplay('miner_analytics', 'none')
      }
    }
  }
}
</script>

<style type="text/css">
#pools_miners, #miner_analytics {
  display: none
}

</style>
