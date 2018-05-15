<template>

  <div>

    <table class="minedBlocksList" v-if="blocks && blocks.length">

      <tr>
        <td>Block</td>
        <td>Timestamp</td>
        <td>Txs</td>
      </tr>

      <tr v-for="block in blocks">

        <td align="left">
          <router-link v-bind:to="{ name: 'Block', params: { block_id: block.block_id }}">{{ block.block_id}}</router-link>
        </td>

        <td align="left">
          {{ block.timestamp }}
        </td>

        <td align="left">
          {{ block.trxs.length }}
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
  },

  methods: {

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    }
  }

}
</script>
