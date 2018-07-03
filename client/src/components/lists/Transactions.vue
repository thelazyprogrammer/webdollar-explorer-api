<template>

  <div class="transactionsWrapper">

    <table v-if="transactions && transactions.length">

    <tr>
      <td>No.</td>
      <td>Block</td>
      <td>From</td>
      <td>To</td>
      <td>Total Amount</td>
      <td>Fee</td>
      <td>Timestamp</td>
    </tr>

    <tr v-for="(trx,index) in transactions" :class=" isReceivingMoney(address,trx.from.address,trx.to.address)">

      <td align="left">
       {{ transactions.length - index}}
      </td>

      <td align="left">
       <router-link replace v-bind:to="{ name: 'Block', params: { block_id: trx.block_id }}">{{ trx.block_id}}</router-link>
      </td>

      <td v-if="trx.transaction" align="left" style="max-width:140px!important">
       <span style="padding-bottom:5px;display: block;" v-for="from_address in trx.transaction.from.addresses">
         <a :href="'#/miner/' + from_address.address">{{ mapAddress(from_address.address) }}</br>{{ formatMoneyNumber(from_address.amount,4)}} </a>
       </span>
      </td>
      <td v-else align="left" style="max-width:140px!important">
       <span style="padding-bottom:5px;display: block;" v-for="from_address in trx.from.addresses">
         <a :href="'#/miner/' + from_address.address">{{ mapAddress(from_address.address) }}</br>{{ formatMoneyNumber(from_address.amount,4)}} </a>
       </span>
      </td>

      <td v-if="trx.transaction" align="left" style="max-width:140px!important">
       <span  style="padding-bottom:5px;display: block;"  v-for="to_address in trx.transaction.to.addresses">
         <a :href="'#/miner/' + to_address.address">{{ mapAddress(to_address.address) }}</br>{{ formatMoneyNumber(to_address.amount,4)}}  </a> </br>
       </span>
      </td>
      <td v-else align="left" style="max-width:140px!important">
       <span  style="padding-bottom:5px;display: block;"  v-for="to_address in trx.to.addresses">
         <a :href="'#/miner/' + to_address.address">{{ mapAddress(to_address.address) }}</br>{{ formatMoneyNumber(to_address.amount,4)}}  </a> </br>
       </span>
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.from.amount*10000,4) }}
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.fee*10000,4) }}
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

    mapAddress(address) {
      address = Utils.mapAddress(address)
      if (address.length > 15) {
       return (address).substring(0,10) + ".." + address.substring(address.length - 5)
      }
      return address
    },

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },

    isReceivingMoney(mainAddress,compareAddressFrom,compareAddressTo){

      if (compareAddressFrom.includes(mainAddress)) return 'toColor';
      if (compareAddressTo.includes(mainAddress)) return 'fromColor';

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
