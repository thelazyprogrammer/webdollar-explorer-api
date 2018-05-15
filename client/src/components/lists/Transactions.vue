<template>

  <div>

    <table class="transactionsTable" v-if="transactions && transactions.length">

    <tr>
      <td>No.</td>
      <td>Block</td>
      <td>From</td>
      <td>To</td>
      <td>Amount</td>
      <td>Fee</td>
      <td>Timestamp</td>
    </tr>

    <tr v-for="(trx,index) in transactions">

      <td align="left">
       {{ transactions.length - index}}
      </td>

      <td align="left">
       <router-link replace v-bind:to="{ name: 'Block', params: { block_id: trx.block_id }}">{{ trx.block_id}}</router-link>
      </td>

      <td align="left">
       <a :href="'#/miner/' + trx.from.address">{{ trx.from.address.substring(0,10)}}..{{ trx.from.address.substring(trx.from.address.length-5) }}</a>
      </td>

      <td align="left">
       <a :href="'#/miner/' + trx.to.address">{{ trx.to.address.substring(0,10)}}..{{ trx.to.address.substring(trx.to.address.length-5) }}</a>
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.from.amount*10000,0) }}
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.fee*10000,2) }}
      </td>

      <td align="left">
       {{ trx.timestamp }}
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
    transactions:{ default:()=>{return [] }},
  },

  methods: {

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    }
  }

}
</script>
