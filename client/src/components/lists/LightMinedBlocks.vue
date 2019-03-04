<template>

  <div>

    <table class="minedBlocksList" v-if="blocks && blocks.length">

      <tr>
        <td>Block</td>
        <td v-if="showMiner"> Miner </td>
        <td v-if="!showMiner"> Algorithm </td>
        <td> Age </td>
        <td>Txs</td>
      </tr>

      <tr v-bind:key="block.number" v-for="block in blocks">

        <td align="left">
          <router-link :class="'block-' + block.algorithm" v-bind:to="{ name: 'Block', params: { block_id: block.number }}">{{ block.number}}</router-link>
        </td>

        <td v-if="showMiner" align="center">
          <a :href="'#/miner/' + block.miner">
            {{ mapAddress(block.miner) }}
          </a>
        </td>

        <td v-if="!showMiner" align="center">
          {{ block.algorithm }}
        </td>

        <td align="center">
          {{ formatDate(block.timestamp, showMiner) }}
        </td>

        <td align="left">
          <a v-if="showMiner" :href="'#/miner/' + block.miner">
            {{ block.trxs_number}} {{ block.transactions }}
          </a>
          <span v-else>
            {{ block.trxs_number}} {{ block.transactions }}
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
<style>
.pagination-wrapper {
  margin: 0!important;
  display: flex;
  justify-content: center!important;
  padding-left: 0;
  list-style: none;
  border-radius: .25rem;
}

.pagination-wrapper li {
  padding: .5rem .75rem;
}

.pagination-wrapper li:hover,
.pagination-wrapper li:focus {
  text-decoration: none;
}

.active > a {
  text-decoration: underline;
  cursor: none;
  color: #00c000!important;
}

</style>
