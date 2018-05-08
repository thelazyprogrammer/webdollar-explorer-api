<template>
  <div class="blocks">
    <div v-if="miner" class="table-wrap">
      <p style="float:left; align:left;text-align: left; height: 10px;width: 100%;"> Miner address: <router-link v-bind:to="{ name: 'Miner', params: { miner_address: miner.address }}">{{ miner.address }}</router-link></p>
      <p style="float:left; width: 100%;text-align: left;"> Total balance: {{ miner.balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Miner balance: {{ miner.miner_balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Transactions sent balance: {{ miner.trx_to_balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Transactions received balance: {{ miner.trx_from_balance }}</p>
      <p v-if="miner.blocks && miner.blocks.length" style="float:left; width: 100%;text-align: left;"> Blocks mined: {{ miner.blocks.length }}</p>
      <p v-if="miner.transactions && miner.transactions.length" style="float:left; width: 100%;text-align: left;"> Transactions: {{ miner.transactions.length }}</p>
      <h2 v-if="miner.transactions && miner.transactions.length">All transactions:</h2>
      <table v-if="miner.transactions && miner.transactions.length">
        <tr>
          <td>Block number</td>
          <td>Timestamp</td>
          <td>From</td>
          <td>To</td>
          <td>Amount</td>
          <td>Fee</td>
        </tr>
        <tr v-for="trx in miner.transactions">
          <td align="left">
            <router-link v-bind:to="{ name: 'Block', params: { block_id: trx.block_id }}">{{ trx.block_id}}</router-link>
          </td>
          <td align="left">
            {{ trx.timestamp }}
          </td>
          <td align="left">
            <router-link v-bind:to="{ name: 'Miner', params: { miner_address: trx.from.address }}">{{ trx.from.address.substring(0,10)}}..{{ trx.from.address.substring(trx.from.address.length-5)}}</router-link>
          </td>
          <td align="left">
            <router-link v-bind:to="{ name: 'Miner', params: { miner_address: trx.to.address }}">{{ trx.to.address.substring(0,10) }}..{{ trx.to.address.substring(trx.to.address.length-5)}}</router-link>
          </td>
          <td align="left">
            {{ trx.from.amount }}
          </td>
          <td align="left">
            {{ trx.fee }}
          </td>
        </tr>
      </table>
      <h2 v-if="miner.blocks && miner.blocks.length">All mined blocks:</h2>
      <table v-if="miner.blocks && miner.blocks.length">
        <tr>
          <td>Block number</td>
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
