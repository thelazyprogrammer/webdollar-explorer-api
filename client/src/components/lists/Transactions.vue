<template>

  <div class="transactionsWrapper">

    <table v-if="transactions && transactions.length">

    <tr>
      <td>Block</td>
      <td>From</td>
      <td>To</td>
      <td>Amount</td>
      <td>Fee</td>
      <td>Age</td>
    </tr>

    <tr v-bind:key="trx.block_id" v-for="(trx) in transactions" :class=" isReceivingMoney(address,trx.from.address,trx.to.address)">

      <td align="left">
       <router-link replace v-bind:to="{ name: 'Block', params: { block_id: trx.block_number }}">{{ trx.block_number}}</router-link>
      </td>

      <td v-if="trx.from.trxs">
        <div class="poolTransactions">
          <span style="padding-bottom:5px;display: block;" v-bind:key="from_address_trx.trx_from_address" v-for="from_address_trx in trx.from.trxs">
            <a :href="'#/miner/' + from_address_trx.trx_from_address">{{ mapAddress(from_address_trx.trx_from_address) }}<br>{{ formatMoneyNumber(from_address_trx.trx_from_amount,4)}} </a>
          </span>
        </div>
      </td>

      <td v-else>
        <div class="poolTransactions">
          <span  style="padding-bottom:5px;display: block;" v-bind:key="to_address_trx.trx_to_address" v-for="to_address_trx in trx.from.addresses">
            <a :href="'#/miner/' + to_address_trx.address">{{ mapAddress(to_address_trx.address) }}<br>{{ formatMoneyNumber(to_address_trx.amount,4)}}  </a> <br>
          </span>
        </div>
      </td>

      <td v-if="trx.to.trxs">
        <div class="poolTransactions">
          <span  style="padding-bottom:5px;display: block;" v-bind:key="to_address_trx.trx_to_address" v-for="to_address_trx in trx.to.trxs">
            <a :href="'#/miner/' + to_address_trx.trx_to_address">{{ mapAddress(to_address_trx.trx_to_address) }}<br>{{ formatMoneyNumber(to_address_trx.trx_to_amount,4)}}  </a> <br>
          </span>
        </div>
      </td>

      <td v-else>
        <div class="poolTransactions">
          <span  style="padding-bottom:5px;display: block;" v-bind:key="to_address_trx.trx_to_address" v-for="to_address_trx in trx.to.addresses">
            <a :href="'#/miner/' + to_address_trx.address">{{ mapAddress(to_address_trx.address) }}<br>{{ formatMoneyNumber(to_address_trx.amount,4)}}  </a> <br>
          </span>
        </div>
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.from.amount,4) }}
      </td>

      <td align="left">
       {{ formatMoneyNumber(trx.fee,4) }}
      </td>

      <td align="left">
       {{ formatDate(trx.timestamp) }} <br/> <span style="font-size: 0.7em"> {{ formatDateGMT(trx.timestamp) }} </span>
      </td>
    </tr>

    </table>

  </div>

</template>

<script>

import Utils from '@/services/utils'
let moment = require('moment')

export default {

  name: 'transactions',

  props: {
    transactions: { default: () => { return [] } },
    address: { default: () => { return [] } }
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

    isReceivingMoney (mainAddress, compareAddressFrom, compareAddressTo) {
      if (mainAddress && compareAddressFrom && compareAddressTo) {
        if (compareAddressFrom.includes(mainAddress)) return 'toColor'
        if (compareAddressTo.includes(mainAddress)) return 'fromColor'
      }
      return ''
    },
    formatDate (timestamp) {
      if (timestamp) {
        timestamp = new Date(timestamp * 1000)
        let fromNow = moment(timestamp).fromNow()
        return fromNow.replace(' ago', '')
      } else {
        return 'not mined yet'
      }
    },
    formatDateGMT (timestamp) {
      if (timestamp) {
        return moment(timestamp * 1000).format('DD.MM.YYYY HH:mm')
      } else {
        return ''
      }
    }

  }

}
</script>

<style>
</style>
