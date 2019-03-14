<template>
  <div class="blocks">

    <div id="address" v-if="miner && miner.address" class="table-wrap">

     <miner-info :miner="this.miner"></miner-info>
     <div class="sliderWrapper">
         <vue-slider @drag-end="onTimeIntervalChange" :tooltipDir.sync="tooltipDir" :piecewise.sync="piecewise" :data.sync="data" :value.sync="value"></vue-slider>
     </div>
     <div  :class="miner.transactions.length === 0 || miner.blocks.length === 0 ? 'minedBlocksAndTransactionsRevert' : '' ">

        <div class="tabWrapper">
          <button id="button_trx" v-if="miner.transactions_number" class="w3-bar-item w3-button" v-on:click="openTab('transactions')">Transactions <br> ({{ getTrxNumber(miner.transactions_number, miner.transactions.length)}})</button>
          <button id="button_block" v-if="miner.blocks_number" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('blocks')">Mined Blocks <br> ({{ getTrxNumber(miner.blocks_number, miner.blocks.length)}})</button>
          <button id="button_block_resolved" v-if="this.blocksr_number" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('blocks_resolved')">Resolved Blocks <br> ({{ getTrxNumber(this.blocksr_number, this.blocksr.length)}})</button>
          <button id="button_pools_stats" v-if="this.poolStats.length > 0" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('pool_stats')">Live Pool Stats<br></button>
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
      </div>

    </div>

    <loading v-else></loading>

  </div>
</template>

<script>
/* eslint-disable no-unmodified-loop-condition */

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
import PoolsService from '@/services/PoolsService'
import Transactions from '@/components/lists/Transactions.vue'
import MinerInfo from '@/components/infoComponents/MinerInfo.vue'
import LightBlocks from '@/components/lists/LightMinedBlocks.vue'
import PoolStats from '@/components/lists/PoolStats.vue'
import Loading from '@/components/utils/Loading'
import vueSlider from 'vue-slider-component'
export default {

  components: { vueSlider, Transactions, MinerInfo, LightBlocks, Loading, PoolStats },

  name: 'miner',

  data () {
    return {
      showLatestTransactions: true,
      showMiner: 'doNotShowClass',
      showTransactions: 'showClass',
      miner: { default: function () { return { } } },
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
      poolStats: []
    }
  },
  beforeRouteUpdate (to) {
    this.getMiner()
  },

  destroyed () {
    this.miner = {}
    this.poolStats = []
  },

  mounted () {
    this.miner = {}
    this.poolStats = []
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
    async getMiner (miner, startDate, endDate) {
      this.miner = {}
      miner = window.location.href.substring(window.location.href.indexOf('WEBD'), window.location.href.length)
      let minerTask = BlocksService.fetchMiner(miner, !this.showLatestTransactions, startDate, endDate)
      let blocksTask = BlocksService.fetchBlocks(1, miner)
      let blocksResolvedTask = BlocksService.fetchBlocks(1, '', miner)
      let transactionsTask = BlocksService.fetchTransactions(1, miner)

      let minerData = await minerTask
      let blocks = await blocksTask
      let blocksResolved = await blocksResolvedTask
      let transactions = await transactionsTask
      this.miner = minerData.data

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

      this.poolStats = []
      let poolStats = []
      try {
        poolStats = await PoolsService.fetchPoolStatsWMP()
      } catch (ex) {}
      let poolMiners = poolStats.data || []
      let minerNumber = 0
      let minerPool = {}
      let hashes = 0
      for (var minerIndex = 0; minerIndex < poolMiners.length; minerIndex++) {
        if (poolMiners[minerIndex].address === miner) {
          minerPool = poolMiners[minerIndex]
          if (minerPool.hashes_alt) { hashes += minerPool.hashes_alt }
          minerNumber++
        }
      }
      if (minerNumber > 0) {
        minerPool.address = 'WEBD$gCrEhDsa9Wv$@x3QkNd4jbNcb5bISk8Nyv$'
        minerPool.miners = minerNumber
        minerPool.power = hashes
        this.poolStats.push(minerPool)
      }

      poolStats = []
      hashes = 0
      try {
        poolStats = await PoolsService.fetchPoolStatsBACM()
      } catch (ex) {}
      poolMiners = poolStats.data || []
      minerNumber = 0
      for (var minerIndex1 = 0; minerIndex1 < poolMiners.length; minerIndex1++) {
        if (poolMiners[minerIndex1].address === miner) {
          minerPool = poolMiners[minerIndex1]
          if (minerPool.hashes_alt) { hashes += minerPool.hashes_alt }
          minerNumber++
        }
      }
      if (minerNumber > 0) {
        minerPool.address = 'WEBD$gCsh0nNrsZv9VYQfe5Jn$9YMnD4hdyx62n$'
        minerPool.miners = minerNumber
        minerPool.power = hashes
        this.poolStats.push(minerPool)
      }
      poolStats = []
      hashes = 0
      try {
        poolStats = await PoolsService.fetchPoolStatsROXANA()
      } catch (ex) {}
      poolMiners = poolStats.data || []
      minerNumber = 0
      for (var minerIndex2 = 0; minerIndex2 < poolMiners.length; minerIndex2++) {
        if (poolMiners[minerIndex2].address === miner) {
          minerPool = poolMiners[minerIndex2]
          if (minerPool.hashes_alt) { hashes += minerPool.hashes_alt }
          minerNumber++
        }
      }
      if (minerNumber > 0) {
        minerPool.address = 'WEBD$gD$XiN5r1uVU#QgZRhM@en8dR1xLB@BEtf$'
        minerPool.miners = minerNumber
        minerPool.power = hashes
        this.poolStats.push(minerPool)
      }

      poolStats = []
      try {
        poolStats = await PoolsService.fetchPoolStatsCOFFEE()
      } catch (ex) {}
      poolMiners = poolStats.data.miners || []
      minerNumber = 0
      minerPool = {}
      for (var minerIndex3 = 0; minerIndex3 < poolMiners.length; minerIndex3++) {
        if (poolMiners[minerIndex3].address === miner) {
          minerPool = poolMiners[minerIndex3]
          minerPool.power = minerPool.hashes
          break
        }
      }
      if (minerPool.address) {
        minerPool.address = 'WEBD$gCMxAKX96yhmaygo@NG+vnb4cz1eYoYpMv$'
        minerPool.miners = minerPool.instances
        minerPool.reward_sent = minerPool.total_sent * 10000
        minerPool.reward_total = minerPool.reward_total * 10000
        minerPool.power = minerPool.hps
        this.poolStats.push(minerPool)
      }
    },

    formatMoneyNumber (number, decimals) {
      return Utils.formatMoneyNumber(number, decimals)
    },

    setDisplay (el, type) {
      if (document.getElementById(el)) {
        document.getElementById(el).style.display = type
      }
    },

    setColor (el, color) {
      if (document.getElementById(el)) {
        document.getElementById(el).style.backgroundColor = color
      }
    },

    openTab (name) {
      if (name === 'blocks') {
        this.setDisplay('blocks', 'block')
        this.setDisplay('transactions', 'none')
        this.setDisplay('blocks_resolved', 'none')
        this.setDisplay('pools_stats', 'none')
        this.setColor('button_pools_stats', '#a4c0ab')
        this.setColor('button_block', '#00c02c')
        this.setColor('button_trx', '#a4c0ab')
        this.setColor('button_block_resolved', '#a4c0ab')
      } else if (name === 'blocks_resolved') {
        this.setDisplay('blocks', 'none')
        this.setDisplay('transactions', 'none')
        this.setDisplay('blocks_resolved', 'block')
        this.setDisplay('pools_stats', 'none')
        this.setColor('button_pools_stats', '#a4c0ab')
        this.setColor('button_block', '#a4c0ab')
        this.setColor('button_trx', '#a4c0ab')
        this.setColor('button_block_resolved', '#00c02c')
      } else if (name === 'pool_stats') {
        this.setDisplay('blocks', 'none')
        this.setDisplay('transactions', 'none')
        this.setDisplay('blocks_resolved', 'none')
        this.setDisplay('pools_stats', 'block')
        this.setColor('button_block', '#a4c0ab')
        this.setColor('button_trx', '#a4c0ab')
        this.setColor('button_block_resolved', '#a4c0ab')
        this.setColor('button_pools_stats', '#00c02c')
      } else {
        this.setDisplay('blocks', 'none')
        this.setDisplay('transactions', 'block')
        this.setDisplay('blocks_resolved', 'none')
        this.setDisplay('pools_stats', 'none')
        this.setColor('button_pools_stats', '#a4c0ab')
        this.setColor('button_block', '#a4c0ab')
        this.setColor('button_trx', '#00c02c')
        this.setColor('button_block_resolved', '#a4c0ab')
      }
    }
  }
}
</script>

<style type="text/css">
#blocks, #blocks_resolved, #transactions, #pool_stats {
  display:none;
}

.doNotShowClass {
 display:inherit;
}

.showClass {
 display:none;
}

.spinner {
  width: 40px;
  height: 40px;

  position: relative;
  margin: 100px auto;
}

.transactionsTable{
  width: 1000px!important
}

  .minedBlocksAndTransactions{
    display: grid;
    grid-template-columns: 460px 1fr;
  }

  .minedBlocksAndTransactionsRevert{
    display: block;
  }

.w3-bar .w3-bar-item {
    padding: 8px 10px 10px 16px;
    float: left;
    width: auto;
    border: none;
    display: block;
    outline: 0;
    user-select: none;
    height: 45px;
}

.w3-btn, .w3-button {
    border: none;
    height: 45px;
    display: inline-block;
    padding: 8px 16px;
    vertical-align: middle;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    background-color: #00c02c;
    text-align: center;
    cursor: pointer;
}

.tabWrapper {
    text-align: left;
    width: 670px;
    padding: 0 0 10px 0;
    margin: 0 auto;
    margin-top:40px;
    border-radius: 15px;
    overflow: hidden;
}

.sliderWrapper {
    text-align: left;
    width: 670px;
    padding: 0 0 0 0;
    margin: 0 auto;
    margin-top:40px;
}

.transactionsWrapper table span:first-child {
  font-weight: bold;
  text-shadow: 0 0 3px #0804f3;
}

.transactionsWrapper table span:first-child {
  font-weight: bold;
  text-shadow: 0 0 3px #0804f3;
}

.latestTrx {
    margin: 0px auto;
    width: 680px;
    border: none;
    display: inline-block;
    padding: 8px 16px;
    vertical-align: middle;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    background-color: #00c02c;
    text-align: center;
    cursor: pointer;
}

.vue-slider-component .vue-slider-process {
    border: 1px solid #fec02c;
    background-color: #fec02c;
}

.vue-slider-component .vue-slider-tooltip {
    border: 1px solid #fec02c;
    background-color: #fec02c;
}

.vue-slider-component .vue-slider-piecewise-dot {
  background-color: #00c02c;
  width: 12px;
  height: 12px;
}
</style>
