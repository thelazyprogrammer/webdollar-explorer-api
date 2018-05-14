<template>
  <div class="blocks">
    <div v-if="miner" class="table-wrap">
      <p style="float:left; align:left;text-align: left; height: 10px;width: 100%;"> Miner address:  <a :href="'#/miner/' + miner.address">{{ miner.address }}</a></p>
      <p style="float:left; width: 100%;text-align: left;"> WEBD balance: {{ miner.balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Mined amount: {{ miner.miner_balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Transactions sent amount: {{ miner.trx_to_balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Transactions received amount: {{ miner.trx_from_balance }}</p>
      <p v-if="miner.blocks && miner.blocks.length" style="float:left; width: 100%;text-align: left;"> Blocks mined: {{ miner.blocks.length }}</p>
      <p v-if="miner.transactions && miner.transactions.length" style="float:left; width: 100%;text-align: left;"> Transactions: {{ miner.transactions.length }}</p>
      <h2 v-if="miner.transactions && miner.transactions.length">Transactions</h2>
      <table v-if="miner.transactions && miner.transactions.length">
        <tr>
          <td>Block</td>
          <td>From</td>
          <td>To</td>
          <td>Amount</td>
          <td>Fee</td>
          <td>Timestamp</td>
        </tr>
        <tr v-for="trx in miner.transactions">
          <td align="left">
            <router-link replace v-bind:to="{ name: 'Block', params: { block_id: trx.block_id }}">{{ trx.block_id}}</router-link>
          </td>
          <td align="left">
            <a :href="'#/miner/' + trx.from.address">{{ trx.from.address.substring(0,10)}}..{{ trx.from.address.substring(trx.from.address.length-5) }}</a>
          </td>
          <td align="left">
            <a :href="'#/miner/' + trx.to.address">{{ trx.to.address.substring(0,10)}}..{{ trx.to.address.substring(trx.to.address.length-5) }}</a>
          </td>
          <td align="left">
            {{ trx.from.amount }}
          </td>
          <td align="left">
            {{ trx.fee }}
          </td>
          <td align="left">
            {{ trx.timestamp }}
          </td>
        </tr>
      </table>
      <h2 v-if="miner.blocks && miner.blocks.length">Mined blocks</h2>
      <table v-if="miner.blocks && miner.blocks.length">
        <tr>
          <td>Block</td>
          <td>Timestamp</td>
        </tr>
        <tr v-for="block in miner.blocks">
          <td align="left">
            <router-link v-bind:to="{ name: 'Block', params: { block_id: block.block_id }}">{{ block.block_id}}</router-link>
          </td>
          <td align="left">
            {{ block.timestamp }}
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
  beforeRouteUpdate (to) {
  //  this.$route.params.miner_address = to.params.miner_address
    this.getMiner(to.params.miner_address)
  },
  mounted () {
    this.getMiner(window.location.href.substring(34,window.location.href.length))
  },
  methods: {
    async getMiner (miner) {
      const response = await BlocksService.fetchMiner(miner)
      this.miner = response.data
    }
  }
}
</script>
<style type="text/css">
.table-wrap {
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
