<template>
  <div class="fame">
  <h2> Thank you for donating to the WebDollar Explorer.</h2>
  <h2> Total donations: {{ fame.total_donations}} WEBD</h2>
  <h2> Donors:</h2>
  <table class="transactionsTable" v-if="fame.donors && fame.donors.length">

    <tr>
      <td>No.</td>
      <td>Block</td>
      <td>From</td>
      <td>From address</td>
      <td>Amount</td>
    </tr>

    <tr v-for="(donor,index) in fame.donors">

      <td align="left">
       {{ fame.donors.length - index}}
      </td>

      <td align="left">
       <router-link replace v-bind:to="{ name: 'Block', params: { block_id: donor.block_id }}">{{ donor.block_id}}</router-link>
      </td>

      <td align="left">
        {{ donor.label }}
      </td>

      <td align="left">
       <a :href="'#/miner/' + donor.address">{{ donor.address.substring(0,10)}}..{{ donor.address.substring(donor.address.length-5) }} </a>
      </td>

      <td align="left" style="text-align:center">
       {{ formatMoneyNumber(donor.amount) }}
      </td>
   </tr>
  </table> 
  </div>

</template>

<script>

import Utils from '@/services/utils'
export default {
  name: 'fame',

  components:{ },

  data () {
    return {
      fame: {
        total_donations: 0,
        donors: [
          {
            address: 'WEBD$gD5dvw68wBDv@oT9FMUs1aW0Fb@aJPkc0P$',
            amount: 200000,
            label: 'WebDollar Team',
            block_id: 86855
          },
          {
            address: 'WEBD$gBXNNDvq@jug#duYkXkXdY1enIuwLPf@vn$',
            amount: 2000,
            label: 'unknown',
            block_id: 70184
          },
          {
            address: 'WEBD$gBDFBN91hGi7xc9tV$85ebVUeSW$kqf377$',
            amount: 1000,
            label: 'unknown',
            block_id: 62945
          },
          {
            address: 'WEBD$gDovA1ro$Ug@#AH6GWz0U31xnT0pcYZpSn$',
            amount: 6000,
            label: 'unknown',
            block_id: 59224
          },
          {
            address: 'WEBD$gAfSEqhYo9vi7IW0q5tAnkPoIGqSb8jBpH$',
            amount: 666,
            label: 'unknown',
            block_id: 59219
          },
          {
            address: 'WEBD$gD0MqvRFWEUtcejzMNzBRTwSA+MZ@sKnKT$',
            amount: 810,
            label: 'unknown',
            block_id: 59175
          },
          {
            address: 'WEBD$gDkW##tQyNXZeUmaSZw8hH0HZnZC1tGgU$$',
            amount: 100,
            label: 'unknown',
            block_id: 57496
          },
          {
            address: 'WEBD$gBUJY3H7YcupFhtfT$2XWBQn0#tbh7PEdn$',
            amount: 5999.99,
            label: 'unknown',
            block_id: 41902 
          },
          {
            address: 'WEBD$gBNENzYYBi89FVVExdRQh3UiJYFeVMSLej$',
            amount: 99999.99,
            label: 'WebDollar Team',
            block_id: 41709
          },
          {
            address: 'WEBD$gCZqzyeqn0K8gSPvzr8@B023ros7JfJNML$',
            amount: 4998.99,
            label: 'unknown',
            block_id: 41620
          },
          {
            address: 'WEBD$gDSZWCUp8VQ9DnaG$uS2uoUBTK4HiN9eHz$',
            amount: 1000,
            label: 'unknown',
            block_id: 40804
          },
          {
            address: 'WEBD$gD0abXEZD+D1oZRH@TDTpcVrBGLjLP8JNH$',
            amount: 9.99,
            label: 'unknown',
            block_id: 39536
          },
          {
            address: 'WEBD$gDXysw7Ud2d+kDvaR$20wktmcuWRc@cjrL$',
            amount: 4999.99,
            label: 'unknown',
            block_id: 39385
          },
          {
            address: 'WEBD$gBVrTf#M#RX+cyW2Sng3mz8yz4A9QqWAL$$',
            amount: 4999.99,
            label: 'unknown',
            block_id: 39365
          },
          {
            address: 'WEBD$gAoLt4T0UMBmpm7QMpk14Sd@TJozv7ZTPL$',
            amount: 200,
            label: 'unknown',
            block_id: 30311
          }
        ]
      }
    }
  },
  mounted () {
    this.getTotalDonations()
  },
  methods: {
    formatMoneyNumber(number){
      return Utils.formatMoneyNumber(number * 10000, 0);
    },
    getTotalDonations() {
      var total_donations = 0
      this.fame.donors.forEach(function(donor) {
        total_donations = (total_donations * 10000 + donor.amount * 10000) / 10000
      }); 
      this.fame.total_donations = Utils.formatMoneyNumber(total_donations.toFixed(2) * 10000,0)
    }
  }
}
</script>
<style type="text/css">

</style>
