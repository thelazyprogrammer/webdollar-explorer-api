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

    <tr v-for="(trx,index) in transactions" :class=" isRecivingMoney(address,trx.from.address,trx.to.address) ">

      <td align="left">
       {{ transactions.length - index}}
      </td>

      <td align="left">
       <router-link replace v-bind:to="{ name: 'Block', params: { block_id: trx.block_id }}">{{ trx.block_id}}</router-link>
      </td>

      <td align="left" style="max-width:170px!important">
       <span v-for="from_address in trx.from.address">
         <a :href="'#/miner/' + from_address">{{ from_address.substring(0,10)}}..{{ from_address.substring(from_address.length-5) }} </a>
       </span>
      </td>

      <td align="left" style="max-width:170px!important">
       <span v-for="to_address in trx.to.address">
         <a :href="'#/miner/' + to_address">{{ to_address.substring(0,10)}}..{{ to_address.substring(to_address.length-5) }} </a>
       </span>
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
    address: { default:()=>{return [] }}
  },

  methods: {

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },

    isRecivingMoney(mainAddress,compareAddressFrom,compareAddressTo){

      if (mainAddress===compareAddressFrom) return 'toColor';
      if (mainAddress===compareAddressTo) return 'fromColor';

      return '';

    }

  }

}
</script>

<style>

  .fromColor, .fromColor a{
    color: #35b151!important;
  }

  .toColor, .toColor a{
    color: #da6654!important;
  }

</style>
