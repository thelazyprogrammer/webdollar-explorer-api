<template>

  <div>

    <table class="minedBlocksList" v-if="blocks && blocks.length">

      <tr>
        <td>Block</td>
        <td> {{ showMiner === true ? 'Miner' : 'Timestamp' }} </td>
        <td v-if="showMiner == true"> Timestamp </td>
        <td>Txs</td>
      </tr>

      <tr v-for="block in blocks">

        <td align="left">
          <router-link v-if="showMiner" v-bind:to="{ name: 'Block', params: { block_id: block.id }}">{{ block.id}}</router-link>
          <router-link v-else v-bind:to="{ name: 'Block', params: { block_id: block.block_id }}">{{ block.block_id}}</router-link>
        </td>

        <td align="left">
          <a v-if="showMiner" :href="'#/miner/' + block.miner_address">
            {{ block.miner_address }}
          </a>
          <span v-else>
            {{ block.timestamp }}
          </span>
        </td>
        <td v-if="showMiner == true" align="left">
          <span>
            {{ block.timestamp }}
          </span>
        </td>

        <td align="left">
          <a v-if="showMiner" :href="'#/miner/' + block.miner_address">
            {{ block.trxs.length }}
          </a>
          <span v-else>
            {{ block.trxs }}
          </span>
        </td>

      </tr>

    </table>

  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
export default {

  name: 'transactions',

  props:{
    blocks:{ default:()=>{return [] }},
    showMiner: { default: true }
  },

  methods: {

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    }
  }

}
</script>
