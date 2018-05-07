<template>
  <div class="blocks">
    <h1>WebDollar Explorer</h1>
    <div v-if="miner" class="table-wrap">
      <h4 style="float:left; align:left;text-align: left; height: 10px;width: 100%;"> Miner address: {{ miner.address }}</h4>
      <h4 style="float:left; width: 100%;text-align: left;"> Miner balance: {{ miner.balance }}</h4>
      <h4 v-if="miner.transactions && miner.transactions.length" style="float:left; width: 100%;text-align: left;"> Transactions: {{ miner.transactions.length }}</h4>
      <table v-if="miner.transactions && miner.transactions.length">
        <tr>
          <td>From</td>
          <td>To</td>
          <td>Amount</td>
          <td>Fee</td>
        </tr>
        <tr v-for="trx in miner.transactions">
          <td align="left">
            {{ trx.from.address }}
          </td>
          <td align="left">
            {{ trx.to.address }}
          </td>
          <td align="left">
            {{ trx.from.amount }}
          </td>
          <td align="left">
            {{ trx.fee }}
          </td>
        </tr>
      </table>
    </div>
    <div v-else>
      There are no miners with this address <br /><br />
    </div>
  </div>
</template>

<script>
import BlocksService from '@/services/BlocksService'
export default {
  name: 'miner',
  data () {
    return {
      miner: []
    }
  },
  mounted () {
    this.getMiner()
  },
  methods: {
    async getMiner () {
      const response = await BlocksService.fetchMiner(this.$route.params.miner_address,)
      this.miner = response.data
    }
  }
}
</script>
<style type="text/css">
.table-wrap {
  width: 60%;
  margin: 0 auto;
  text-align: center;
}
table th, table tr {
  text-align: left;
}
table thead {
  background: #f2f2f2;
}
table tr td {
  padding: 10px;
}
table tr:nth-child(odd) {
  background: #f2f2f2;
}
table tr:nth-child(1) {
  background: #4d7ef7;
  color: #fff;
}
a {
  color: #4d7ef7;
  text-decoration: none;
}
a.add_post_link {
  background: #4d7ef7;
  color: #fff;
  padding: 10px 80px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: bold;
}
</style>
