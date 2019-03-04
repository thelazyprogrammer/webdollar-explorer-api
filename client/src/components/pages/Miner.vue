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
          <button id="button_block_resolved" v-if="miner.blocks_resolved_number" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('blocks_resolved')">Resolved Blocks <br> ({{ getTrxNumber(miner.blocks_resolved_number, miner.blocks_resolved.length)}})</button>
        </div>

        <div class="address_tab" id="transactions">
          <transactions :address="this.miner.address" :transactions="this.miner.transactions"></transactions>
        </div>

        <div class="addressTab transactionsWrapper" id="blocks">
          <light-blocks :pages="this.miner.blocks.pages" :showMiner="false" :blocks="this.miner.blocks"></light-blocks>
          <paginate v-if="this.miner.blocks && this.miner.blocks.length" page="this.miner.blocks.page_number"
            :page-count="this.miner.blocks.pages" :click-handler="changeBlocks" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper'">
          </paginate>
        </div>

        <div class="addressTab transactionsWrapper" id="blocks_resolved">
          <light-blocks :showMiner="false" :blocks="this.miner.blocks_resolved"></light-blocks>
        </div>

      </div>

    </div>

    <loading v-else></loading>

  </div>
</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import MinerInfo from '@/components/infoComponents/MinerInfo.vue'
import LightBlocks from '@/components/lists/LightMinedBlocks.vue'
import Loading from '@/components/utils/Loading'
import vueSlider from 'vue-slider-component'
export default {

  components:{ vueSlider, Transactions, MinerInfo, LightBlocks, Loading },

  name: 'miner',

  data () {
    return {
      showLatestTransactions: true,
      showMiner: 'doNotShowClass',
      showTransactions: 'showClass',
      miner: {default: function () { return { } }},
      searchAddress: '',
      searchStart: '',
      piecewise: false,
      startDate: false,
      endDate: false,
      tooltipDir: ["top", "bottom"],
      data: {default: function () { return getDates()}},
      value: {default: function () { return getStartEndDates()}},
    }
  },
  beforeRouteUpdate (to) {
    this.getMiner()
  },

  mounted () {
    this.miner = {}
    this.getMiner(window.location.href.substring(window.location.href.indexOf("WEBD"),window.location.href.length))
  },

  methods: {
    async onTimeIntervalChange(el) {
      let intervals = el.getValue()
      
      this.startDate = intervals[0]
      this.endDate = intervals[1]
      this.value = [this.startDate, this.endDate]
      this.getMiner(window.location.href.substring(window.location.href.indexOf("WEBD"),window.location.href.length), this.startDate, this.endDate)
      this.value = [this.startDate, this.endDate]
    },
    async changeBlocks(pageNum) {
      let miner = window.location.href.substring(window.location.href.indexOf("WEBD"),window.location.href.length)
      let blocks = await BlocksService.fetchBlocks(pageNum, miner)
      this.miner.blocks = blocks.data.blocks
      this.miner.blocks_number = blocks.data.blocks_number
      this.miner.blocks.pages = blocks.data.pages
      this.miner.blocks.page_number = blocks.data.page_number

    },
    getStartEndDates() {
      let days = this.getDates()
      if (this.startDate && this.endDate) {
        return [this.startDate, this.endDate]
      }
      return [days[0], days[days.length - 1]]
    },
    getDates() {
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
          while(start < end) {
            currDay = new Date(start)
            days.push(currDay.toISOString().split('T')[0])
            start.setDate(start.getDate() + 1)
          }
          currDay = new Date(start)
          days.push(currDay.toISOString().split('T')[0])
          return days
    },
    getTrxNumber(all_trx_number, trx_received_number) {
      if (parseInt(trx_received_number) >= parseInt(all_trx_number)) {
        return trx_received_number
      } else {
        return 'latest ' + trx_received_number + ' from ' + all_trx_number
      }
    },
    async getMiner (miner, startDate, endDate) {
      this.miner = {}
      miner = window.location.href.substring(window.location.href.indexOf("WEBD"),window.location.href.length)
      let minerTask = BlocksService.fetchMiner(miner, !this.showLatestTransactions, startDate, endDate)
      let blocksTask = BlocksService.fetchBlocks(1, miner)
      let transactionsTask = BlocksService.fetchTransactions(miner)
      
      let minerData = await minerTask
      let blocks = await blocksTask
      let transactions = await transactionsTask
      this.miner = minerData.data

      if (transactions) {
        let trxs_parsed = []
        var miner_address = miner
        transactions.data.trxs.forEach(function(trx) {
          var index_from = -1
          var index_to = -1

          trx.from.trxs = trx.from.trxs.sort( function(a,b) {
            return (Number(b.trx_from_amount) - Number(a.trx_from_amount))
          })
          trx.from.trxs.forEach(function(trx, index) {
            if (trx.trx_from_address == miner_address) {
              index_from = index
              return
            }
          })

          if (index_from != -1) {
            trx.from.trxs.unshift(trx.from.trxs[index_from])
            trx.from.trxs.splice(index_from + 1, 1)
          }

          trx.to.trxs = trx.to.trxs.sort(function (a,b) {
            return (Number(b.trx_to_amount) - Number(a.trx_to_amount))
          })
          trx.to.trxs.forEach(function(trx, index) {
            if (trx.trx_to_address == miner_address) {
              index_to = index
              return
            }
          })
          if (index_to != -1) {
            trx.to.trxs.unshift(trx.to.trxs[index_to])
            trx.to.trxs.splice(index_to + 1, 1)
          }

          trxs_parsed.push(trx)
        })
        this.miner.transactions = trxs_parsed
      }
      this.miner.transactions_number = transactions.data.trxs_number
      this.miner.blocks = blocks.data.blocks
      this.miner.blocks_number = blocks.data.blocks_number
      this.miner.blocks.pages = blocks.data.pages
      this.data = this.getDates()
      this.value = this.getStartEndDates()

    },

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },

    setDisplay(el, type) {
        if (document.getElementById(el)) {
          document.getElementById(el).style.display = type
        }
    },

    setColor(el, color) {
        if (document.getElementById(el)) {
          document.getElementById(el).style.backgroundColor = color
        }
    },

    openTab(name) {
      if (name=='blocks') {
        this.setDisplay('blocks', 'block')
        this.setDisplay('transactions', 'none')
        this.setDisplay('blocks_resolved', 'none')
        this.setColor('button_block', "#00c02c")
        this.setColor('button_trx', "#a4c0ab")
        this.setColor('button_block_resolved', "#a4c0ab")
      } else if (name=='blocks_resolved') {
        this.setDisplay('blocks', 'none')
        this.setDisplay('transactions', 'none')
        this.setDisplay('blocks_resolved', 'block')
        this.setColor('button_block', "#a4c0ab")
        this.setColor('button_trx', "#a4c0ab")
        this.setColor('button_block_resolved', "#00c02c")
      } else {
        this.setDisplay('blocks', 'none')
        this.setDisplay('transactions', 'block')
        this.setDisplay('blocks_resolved', 'none')
        this.setColor('button_block', "#a4c0ab")
        this.setColor('button_trx', "#00c02c")
        this.setColor('button_block_resolved', "#a4c0ab")
      }
    }
  }
}
</script>

<style type="text/css">
#blocks {
  display:none;
}

#blocks_resolved {
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
    padding: 0 0 10px 0;
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
