<template>

  <div class="transactionsWrapper">

    <table>

      <tr>
        <td>No.</td>
        <td>Miner</td>
        <td>Potential</td>
        <td>Stake</td>
        <td>PoW</td>
      </tr>
      <tr v-bind:key="miner.miner_ip" v-for="(miner,index) in miners">
        <td align="left">
         {{ index + 1 }}
        </td>
        <td align="center">
          <a :href="'#/miner/' + miner.address">{{ mapAddress(miner.address) }} </a>
        </td>

        <td align="left">
         {{ formatMoneyNumber(miner.reward_confirmed, 10000) }}
        </td>
        <td align="left">
         {{ formatMoneyNumber(miner.totalPOSBalance, 10000) }}
        </td>
        <td align="left">
         {{ formatPower(miner.hashes_alt) }}
        </td>

      </tr>

    </table>

  </div>

</template>

<script>

import Utils from '@/services/utils'
let moment = require('moment')

export default {

  name: 'pool-live-miners',

  props: {
    miners: { default: () => { return [] } },
    page_number: { default: () => { return 1 } },
    page_size: { default: () => { return 10 } }
  },

  methods: {

    mapAddress (address) {
      address = Utils.mapAddress(address)
      if (address && address.length > 15) {
        return (address).substring(0, 10) + '..' + address.substring(address.length - 5)
      }
      return address
    },

    formatMoneyNumber (number, decimals) {
      return Utils.formatMoneyNumber(number, decimals)
    },

    formatPower (number) {
      return Utils.formatPower(number)
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
    }

  }

}
</script>
