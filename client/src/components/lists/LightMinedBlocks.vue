<template>

  <div>

    <table class="minedBlocksList" v-if="blocks && blocks.length">

      <tr>
        <td>Block</td>
        <td v-if="showMiner">Miner</td>
        <td v-if="showResolver">Resolver</td>
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

        <td v-if="showResolver" align="center">
          <a :href="'#/miner/' + (block.resolver || block.miner)">
            {{ mapAddress(block.resolver || block.miner) }}
          </a>
        </td>

        <td align="center">
          {{ formatDate(block.timestamp) }}
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

var moment = require('moment')

export default {

  name: 'transactions',
  props: {
    blocks: { default: () => { return [] } },
    showMiner: { default: true },
    showResolver: { default: false },
    showAlgorithm: { default: false }
  },

  methods: {
    mapAddress (address) {
      address = Utils.mapAddress(address)
      if (address.length > 15) {
        return (address).substring(0, 10) + '..' + address.substring(address.length - 5)
      }
      return address
    },
    formatMoneyNumber (number, decimals) {
      return Utils.formatMoneyNumber(number, decimals)
    },
    formatDate (timestamp) {
      let blockDate = new Date(timestamp * 1000)
      return moment(blockDate).fromNow()
    }
  }

}
</script>
<style>

</style>
