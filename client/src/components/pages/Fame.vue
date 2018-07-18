<template>
  <div class="fame">
  <h2> Thank you for donating to the WebDollar Explorer.</h2>
  <h2> Total donations: {{ fame.total_donations}} WEBD</h2>
  <h2> Donors:</h2>
  <table class="fameTable" v-if="fame.donors && fame.donors.length">

    <tr>
      <td>No.</td>
      <td>Block</td>
      <td>From</td>
      <td>From address</td>
      <td>Amount</td>
    </tr>

    <tr v-bind:key="donor.address" v-for="(donor,index) in fame.donors">

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
import SpecialAddresses from '@/services/SpecialAddresses'
export default {
  name: 'fame',

  components:{ },

  data () {
    return {
      fame: SpecialAddresses.fame
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
