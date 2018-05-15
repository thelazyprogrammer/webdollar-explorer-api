<template>
  <div class="blocks">

    <div v-if="block">

      <block-info :block="this.block"></block-info>

      <div>

        <h2>Transactions</h2>

        <transactions :transactions="block.trxs"></transactions>

      </div>

    </div>

    <div v-else>
      There are no blocks <br /><br />
    </div>

  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import BlockInfo from '@/components/infoComponents/BlockInfo.vue'

export default {
  name: 'block',

  components:{ Transactions, BlockInfo },

  data () {
    return {
      block: []
    }
  },
  mounted () {
    this.getBlock()
  },
  methods: {
    async getBlock () {
      const response = await BlocksService.fetchBlock(this.$route.params.block_id,)
      this.block = response.data
    },

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
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
