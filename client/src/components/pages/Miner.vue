<template>
  <div class="blocks">

    <div id="address" v-if="miner && miner.address" class="table-wrap">

     <miner-info :miner="this.miner"></miner-info>

       <div  :class=" miner.transactions.length === 0 || miner.blocks.length === 0 ? 'minedBlocksAndTransactionsRevert' : '' ">

        <div class="tabWrapper">
          <button id="button_trx" class="w3-bar-item w3-button" v-on:click="openTab('transactions')">Transactions <br> ({{ getTrxNumber(miner.transactions_number, miner.transactions.length)}})</button>
          <button id="button_block" class="w3-bar-item w3-button" style="background-color: #a4c0ab" v-on:click="openTab('blocks')">Mined Blocks <br> ({{miner.blocks.length}})</button>
          <toggle-button v-if="miner.transactions_number > miner.transactions.length" :value="true" :height=45 :width=155 v-model="showLatestTransactions"
               @change="onShowLatestTrnsactions"
               :labels="{checked: 'LatestTransactions', unchecked: 'AllTransactions'}"/>
        </div>

        <div class="address_tab" id="transactions">
          <transactions :address="this.miner.address" :transactions="this.miner.transactions"></transactions>
        </div>

        <div class="addressTab transactionsWrapper" id="blocks">
          <light-blocks :showMiner="false" :blocks="this.miner.blocks"></light-blocks>
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

export default {

  components:{ Transactions, MinerInfo, LightBlocks, Loading },

  name: 'miner',

  data () {
    return {
      showLatestTransactions: true,
      showMiner: 'doNotShowClass',
      showTransactions: 'showClass',
      miner: {default: function () { return { } }},
      searchAddress: '',
      searchStart: ''
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
    async onShowLatestTrnsactions() {
      return this.getMiner()
    },
    getTrxNumber(all_trx_number, trx_received_number) {
      if (parseInt(trx_received_number) >= parseInt(all_trx_number)) {
        return trx_received_number
      } else {
        return 'latest ' + trx_received_number + ' from ' + all_trx_number
      }
    },
    async getMiner (miner) {
      this.miner = {}
      miner = window.location.href.substring(window.location.href.indexOf("WEBD"),window.location.href.length)
      let response = await BlocksService.fetchMiner(miner, !this.showLatestTransactions)
      if (response.data.transactions) {
        let trxs_parsed = []
        var miner_address = response.data.address
        response.data.transactions.forEach(function(trx) {
          var index_from = -1
          var index_to = -1

          trx.transaction.from.addresses = trx.transaction.from.addresses.sort( function(a,b) {
            return (Number(b.amount) - Number(a.amount))
          })
          trx.transaction.from.addresses.forEach(function(trx, index) {
            if (trx.address == miner_address) {
              index_from = index
            }
          })

          if (index_from != -1) {
            trx.transaction.from.addresses.unshift(trx.transaction.from.addresses[index_from])
            trx.transaction.from.addresses.splice(index_from + 1, 1)
          }

          trx.transaction.to.addresses = trx.transaction.to.addresses.sort(function (a,b) {
            return (Number(b.amount) - Number(a.amount))
          })
          trx.transaction.to.addresses.forEach(function(trx, index) {
            if (trx.address == miner_address) {
              index_to = index
            }
          })
          if (index_to != -1) {
            trx.transaction.to.addresses.unshift(trx.transaction.to.addresses[index_to])
            trx.transaction.to.addresses.splice(index_to + 1, 1)
          }

          trxs_parsed.push(trx)
        })
        response.data.transactions = trxs_parsed
      }
      this.miner = response.data

      console.log(this.miner);
    },

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },

    openTab(name) {
      if (name=='blocks') {
        document.getElementById('blocks').style.display = "block"
        document.getElementById('transactions').style.display = "none"
        document.getElementById('button_block').style.backgroundColor = "#00c02c"
        document.getElementById('button_trx').style.backgroundColor = "#a4c0ab"
      } else {
        document.getElementById('blocks').style.display = "none"
        document.getElementById('transactions').style.display = "block"
        document.getElementById('button_trx').style.backgroundColor = "#00c02c"
        document.getElementById('button_block').style.backgroundColor = "#a4c0ab"
      }
    }
  }
}
</script>

<style type="text/css">
#blocks {
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
</style>
