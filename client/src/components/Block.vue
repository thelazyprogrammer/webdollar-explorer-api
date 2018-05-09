<template>
  <div class="blocks">
    <div v-if="block" class="table-wrap">
      <h4 style="float:left; align:left;text-align: left; height: 10px;width: 100%;"> Block number:  <router-link v-bind:to="{ name: 'Block', params: { id: block.id }}">{{ block.id }} </router-link> </h4>
      <h4 style="float:left; width: 100%;text-align: left;"> Block miner: <a :href="'#/miner/' + block.miner_address">{{ block.miner_address }}</a></h4>
      <h4 style="float:left; width: 100%;text-align: left;"> Block timestamp: {{ block.timestamp }}</h4>
      <h4 v-if="block.trxs && block.trxs.length" style="float:left; width: 100%;text-align: left;"> Transactions: {{ block.trxs.length }}</h4>
      <table v-if="block.trxs && block.trxs.length">
        <tr>
          <td>From</td>
          <td>To</td>
          <td>Amount</td>
          <td>Fee</td>
        </tr>
        <tr v-for="trx in block.trxs">
          <td align="left">
            <a :href="'#/miner/' + trx.from.address">{{ trx.from.address }}</a>
          </td>
          <td align="left">
            <a :href="'#/miner/' + trx.to.address">{{ trx.to.address }}</a>
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
      There are no blocks <br /><br />
    </div>
  </div>
</template>

<script>
import BlocksService from '@/services/BlocksService'
export default {
  name: 'block',
  data () {
    return {
      block: []
    }
  },
  mounted () {
    this.getBlock()
  },
  methods: {
    async getBlock () {
      const response = await BlocksService.fetchBlock(this.$route.params.block_id,)
      this.block = response.data
    }
  }
}
</script>
<style type="text/css">
.table-wrap {
  float:left;
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
