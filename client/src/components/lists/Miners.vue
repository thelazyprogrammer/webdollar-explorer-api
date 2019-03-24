<template>

  <div class="transactionsWrapper">

    <table>

      <tr>
        <td>No.</td>
        <td>Miner</td>
        <td>Blocks</td>
        <td>PoS</td>
        <td>PoW</td>
        <td>Amount</td>
        <td>Ratio</td>
      </tr>
      <tr v-bind:key="miner._id" v-for="(miner,index) in miners">
        <td align="left">
         {{ (page_size * (page_number - 1)) + index + 1 }}
        </td>
        <td align="center">
          <a :href="'#/miner/' + miner._id">{{ mapAddress(miner._id) }} </a>
        </td>

        <td align="left">
         {{ miner.blocks }}
        </td>
        <td align="left">
         {{ miner.pos_blocks }}
        </td>
        <td align="left">
         {{ miner.pow_blocks }}
        </td>
        <td align="left">
         {{ formatMoneyNumber(miner.reward) }}
        </td>
        <td align="left">
         {{ miner.ratio }}%
        </td>

      </tr>

    </table>

  </div>

</template>

<script>

import Utils from '@/services/utils'
let moment = require('moment')

export default {

  name: 'miners',

  props: {
    miners: { default: () => { return [] } },
    page_number: { default: () => { return 1 } },
    page_size: { default: () => { return 10 } }
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
    }

  }

}
</script>
