<template>

  <div>

    <table class="minedBlocksList" v-if="blocks && blocks.length">

      <tr>
        <td>Block</td>
        <td v-if="showMiner"> Miner </td>
        <td> Age </td>
        <td>Txs</td>
      </tr>

      <tr v-bind:key="block.number" v-for="block in blocks">

        <td align="left">
          <router-link v-if="showMiner" v-bind:to="{ name: 'Block', params: { block_id: block.number }}">{{ block.number}}</router-link>
          <router-link v-else v-bind:to="{ name: 'Block', params: { block_id: block.number }}">{{ block.number}}</router-link>
        </td>

        <td v-if="showMiner" align="center">
          <a :href="'#/miner/' + block.miner">
            {{ mapAddress(block.miner) }}
          </a>
        </td>

        <td align="center">
          {{ formatDate(block.timestamp, showMiner) }}
        </td>

        <td align="left">
          <a v-if="showMiner" :href="'#/miner/' + block.miner">
            {{ block.trxs_number || block.transactions }}
          </a>
          <span v-else>
            {{ block.trxs || block.trxs_number || block.transactions}}
          </span>
        </td>

      </tr>

    </table>

  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'

var moment = require('moment');

export default {

  name: 'transactions',

  props:{
    blocks:{ default:()=>{return [] }},
    showMiner: { default: true }
  },

  methods: {
    mapAddress(address) {
      return Utils.mapAddress(address)
    },
    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },
    formatDate(timestamp, showMiner){
      let blockDate = new Date(timestamp * 1000)
      let fromNow = moment(blockDate).fromNow()
      if (showMiner) {
        return fromNow
      } else {
        return fromNow + " (" + blockDate.toGMTString() +  ")"
      }
    }
  }

}
</script>
