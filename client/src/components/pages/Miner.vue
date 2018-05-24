<template>
  <div class="blocks">

    <div id="address" v-if="miner && miner.address" class="table-wrap">

     <miner-info :miner="this.miner"></miner-info>

      <div class="minedBlocksAndTransactions" :class=" miner.transactions.length === 0 || miner.blocks.length === 0 ? 'minedBlocksAndTransactionsRevert' : '' ">
        <div class="mineBlocks">

          <h2 v-if="miner.blocks && miner.blocks.length">Mined blocks</h2>

          <light-blocks :showMiner="false" :blocks="this.miner.blocks"></light-blocks>

        </div>

        <div>

          <h2 v-if="miner.transactions && miner.transactions.length">Transactions</h2>

          <transactions :transactions="this.miner.transactions"></transactions>

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
      miner: {default: function () { return { } }},
      searchAddress: '',
      searchStart: ''
    }
  },

  beforeRouteUpdate (to) {
    this.getMiner(to.params.miner_address)
  },

  mounted () {
    this.miner = {}
    this.getMiner(window.location.href.substring(34,window.location.href.length))
  },

  methods: {

    async getMiner (miner) {
      this.miner = {}
      const response = await BlocksService.fetchMiner(miner)
      this.miner = response.data

      console.log(this.miner);
    },

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    }

  }
}
</script>

<style type="text/css">

.minedBlocksList{
  width: 450px!important;
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

</style>
