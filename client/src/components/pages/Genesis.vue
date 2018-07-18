<template>
  <div class="pools">
  <h2> Top 15 Genesis addresses for WebDollar</h2>

  <table class="poolsTable" style="font-size:0.84em;">

    <tr>
      <td>Block</td>
      <td>Address</td>
      <td>Genesis Amount</td>
      <td>Current Amount</td>
      <td>Owner</td>
    </tr>

    <tr v-bind:key="genesis.miner_address" v-for="genesis in genesis_addresses" :class="genesisChange(genesis.reward, genesis.current_reward)">
      <td align="left">
       {{ genesis.id }}
      </td>

      <td align="left">
        <a :href="'#/miner/' + genesis.miner_address">{{ genesis.miner_address }} </a>
      </td>

      <td align="right">
        {{ formatMoneyNumber(genesis.reward,0) }}
      </td>

      <td align="right">
        {{ formatMoneyNumber(genesis.current_reward,0) }}
      </td>

      <td align="left" style="text-align:center">
       WebDollar Team
      </td>
   </tr>
  </table>

  </div>

</template>

<script>
import BlocksService from '@/services/BlocksService'
import Utils from '@/services/utils'

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export default {
  name: 'genesis',

  components:{ },

  data () {
    return {
      genesis_addresses: []
    }
  },
  mounted () {
    this.getBlocks()
  },
  methods: {
    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number * 10000, decimals);
    },
    genesisChange(former, current){
      if (former != current) {
        return "genesisChanged"
      }
      return "genesisUnchanged"
    },
    async getBlocks() {
      for (let i=1; i<16;i++) {
        await sleep(300)
        let response = await BlocksService.fetchBlock(i)
        let block_info = response.data
        if (block_info && block_info.miner_address) {
          let miner_data = await BlocksService.fetchMiner(block_info.miner_address)
          let miner = miner_data.data
          if (miner && miner.address && miner.blocks) {
            this.genesis_addresses.push({
              id: block_info.id,
              reward: block_info.reward,
              miner_address: block_info.miner_address,
              current_reward: miner.balance
            })
          }
        }
      }
    }
  }
}
</script>
<style type="text/css">
</style>
