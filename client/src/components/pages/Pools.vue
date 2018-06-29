<template>
  <div class="pools">
  <h2> Public Pools for WebDollar </h2>

  <table class="transactionsTable">

    <tr>
      <td>No.</td>
      <td>Name</td>
      <td>Address</td>
      <td>Status</td>
      <td>Fee</td>
    </tr>

    <tr v-for="(pool, index) in pools">

      <td align="left">
       {{ index}}
      </td>

      <td align="left">
       <a :href="'#/miner/' + pool.address">{{ pool.name }} </a>
      </td>

      <td align="left">
       <a :href="'#/miner/' + pool.address">{{ pool.address }} </a>
      </td>

      <td align="left" style="text-align:center">
       {{ pool.status }}
      </td>

      <td align="left" style="text-align:center">
       {{ pool.fee }}%
      </td>
   </tr>
  </table>

  <p class="transactionsTable" style="width:100%;max-width: 680px; margin: 0 auto; padding: 10px; margin-top:30px;"> The pool information does not and will not contain its access link, as it might change over time. If one prefers to have its pool information available here, please file a Pull Request to the GitHub repository <a href="https://github.com/thelazyprogrammer/webdollar-explorer-api">here</a>.</p> 
  </div>

</template>

<script>

export default {
  name: 'pools',

  components:{ },

  data () {
    return {
      pools: [
        {
          name: 'WebdDollar Experimental Pool 1',
          address: 'WEBD$gDU+tP3@42@L9$Is463vDJi4IKrabPNNn$$',
          status: 'experimental',
          fee: 2
        },
        {
          name: 'WebdDollar Experimental Pool 2',
          address: 'WEBD$gCGdPQLohdeHQqa+ptoJ@QK2LCvN7IS5JX$',
          status: 'experimental',
          fee: 2
        },
      ]
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
