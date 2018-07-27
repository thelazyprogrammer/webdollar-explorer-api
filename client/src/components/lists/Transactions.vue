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
      <td>Age</td>
    </tr>

    <tr v-bind:key="trx.block_id" v-for="(trx,index) in transactions" :class=" isReceivingMoney(address,trx.from.address,trx.to.address)">

      <td align="left">
       {{ transactions.length - index}}
      </td>

      <td align="left">
       <router-link replace v-bind:to="{ name: 'Block', params: { block_id: trx.block_id }}">{{ trx.block_id}}</router-link>
      </td>

      <td v-if="trx.transaction">
        <div class="poolTransactions">
          <span style="padding-bottom:5px;display: block;" v-bind:key="from_address.address" v-for="from_address in trx.transaction.from.addresses">
            <a :href="'#/miner/' + from_address.address">{{ mapAddress(from_address.address) }}<br>{{ formatMoneyNumber(from_address.amount,4)}} </a>
          </span>
        </div>
      </td>

      <td v-else>
        <div class="poolTransactions">
          <span style="padding-bottom:5px;display: block;" v-bind:key="from_address.address" v-for="from_address in trx.from.addresses">
            <a :href="'#/miner/' + from_address.address">{{ mapAddress(from_address.address) }}<br>{{ formatMoneyNumber(from_address.amount,4)}} </a>
          </span>
        </div>
      </td>

      <td v-if="trx.transaction">
        <div class="poolTransactions">
          <span  style="padding-bottom:5px;display: block;"  v-bind:key="to_address.address" v-for="to_address in trx.transaction.to.addresses">
           <a :href="'#/miner/' + to_address.address">{{ mapAddress(to_address.address) }}<br>{{ formatMoneyNumber(to_address.amount,4)}}  </a> <br>
          </span>
        </div>
      </td>
      <td v-else>
        <div class="poolTransactions">
          <span  style="padding-bottom:5px;display: block;" v-bind:key="to_address.address" v-for="to_address in trx.to.addresses">
            <a :href="'#/miner/' + to_address.address">{{ mapAddress(to_address.address) }}<br>{{ formatMoneyNumber(to_address.amount,4)}}  </a> <br>
          </span>
        </div>
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.from.amount*10000,4) }}
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.fee*10000,4) }}
      </td>

      <td align="left">
       {{ formatDate(trx.timestamp) }}
      </td>
    </tr>

    </table>

  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'
let moment = require('moment')

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
      if (mainAddress && compareAddressFrom && compareAddressTo) {
        if (compareAddressFrom.includes(mainAddress)) return 'toColor';
        if (compareAddressTo.includes(mainAddress)) return 'fromColor';
      }
      return '';

    },
    formatDate(timestamp) {
      if (timestamp) {
        let fromNow = moment(timestamp).fromNow()
        return fromNow + " (" + timestamp +  ")"
      } else {
        return 'not mined yet'
      }
    }

  }

}
</script>

<style>
</style>
