<template>

  <div>

    <table class="minedBlocksList" v-if="stats && stats.length">

      <tr>
        <td align="center">Pool</td>
        <td align="center">Power</td>
        <td align="center">Received amount</td>
        <td align="center">Confirmed amount</td>
        <td align="center">Miners</td>
      </tr>

      <tr v-bind:key="pool.name" v-for="pool in stats">

        <td align="center">
          {{ pool.name }}
        </td>

        <td align="center">
          {{ formatPower(pool.power) }}h/s
        </td>

        <td align="center">
          {{ formatMoneyNumber(pool.reward_sent) }}
        </td>

        <td align="center">
          {{ formatMoneyNumber(pool.reward_confirmed) }}
        </td>

        <td align="center">
          {{ pool.miners }}
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

  name: 'stats',
  props:{
    stats:{ default:()=>{return [] }},
  },

  methods: {
    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },
    formatPower(number) {
      number = Number(number)
      if (isNaN(number)) { number = 0 }
      if (number > 1000) {
        return (number / 1000) + " K"
      }
      return number + " "
    }
  }

}
</script>
