<template>
  <div class="blocks">

    <div v-if="block_loaded">

      <block-info :block="this.block"></block-info>

      <div>

        <h2 v-if="block.trxs && block.trxs.length !== 0">Transactions</h2>

        <transactions :transactions="block.trxs"></transactions>

      </div>

    </div>

    <loading v-else></loading>

  </div>

</template>

<script>

import BlocksService from '@/services/BlocksService'
import Transactions from '@/components/lists/Transactions.vue'
import BlockInfo from '@/components/infoComponents/BlockInfo.vue'
import Loading from '@/components/utils/Loading'

export default {
  name: 'block',

  components: { Transactions, BlockInfo, Loading },

  data () {
    return {
      block: [],
      block_loaded: false
    }
  },
  beforeRouteUpdate (to) {
    this.getBlock(to.params.block_id)
  },
  mounted () {
    this.getBlock()
  },
  methods: {
    async getBlock (blockId) {
      if (!blockId) {
        blockId = this.$route.params.block_id
      }
      this.block_loaded = false
      try {
        let response = await BlocksService.fetchBlock(blockId)
        if (response.data.trxs) {
          let trxsParsed = []
          response.data.trxs.forEach(function (trx) {
            trx.from.addresses = trx.from.trxs.sort((a, b) => Number(b.trx_from_amount) - Number(a.trx_from_amount))
            trx.to.addresses = trx.to.trxs.sort((a, b) => Number(b.trx_to_amount) - Number(a.trx_to_amount))
            trxsParsed.push(trx)
          })
          response.data.trxs = trxsParsed
        }
        this.block = response.data
      } catch (exception) {
        console.log(exception)
        this.block = { block_id: parseInt(blockId) }
      }
      this.block_loaded = true
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
