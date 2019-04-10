<template>
  <div class="pools">
  <h2> Public Pools for WebDollar </h2>

  <table class="poolsTable" style="font-size:0.84em;">

    <tr>
      <td>Name</td>
      <td>Address</td>
      <td>MinPayout</td>
      <td>Fee</td>
      <td>Status</td>
    </tr>

    <tr v-bind:key='pool.address' v-for="pool in pools" :class="pool.status + 'Pool'">

      <td align="left">
       <a :href="'#/miner/' + pool.address">{{ pool.name }} </a>
      </td>

      <td align="left">
       <a :href="'#/miner/' + pool.address">{{ pool.address }} </a>
      </td>

      <td align="left" style="text-align:center">
       {{ pool.min_amount }} WEBD
      </td>

      <td align="left" style="text-align:center">
       {{ pool.fee }}%
      </td>

      <td align="left" style="text-align:center">
       {{ pool.status }}
      </td>
   </tr>
  </table>

  <div class="transactionsTable" style="width: 680px; margin: 0 auto; padding: 10px; margin-top:30px;"> The pool information does not and will not contain its access link, as it might change over time. If one prefers to have its pool information available here, please file a Pull Request to the GitHub repository <a href="https://github.com/thelazyprogrammer/webdollar-explorer-api">here</a>.</div>
  </div>

</template>

<script>
import SpecialAddresses from '@/services/SpecialAddresses'

export default {
  name: 'pools',

  components: { },

  data () {
    return {
      pools: SpecialAddresses.pools.sort(function (a, b) {
        let mapStatus = {
          up: -1,
          down: 1
        }
        return mapStatus[a.status] - mapStatus[b.status]
      })
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>
<style type="text/css">

</style>
