<template>
  <div class="blocks">
    <h1>WebDollar Blocks</h1>
    <div v-if="blocks" class="table-wrap">
      <table>
        <tr>
          <td>Block Number</td>
          <td>Block Miner</td>
          <td>Block Transactions</td>
        </tr>
        <tr v-for="block in blocks">
          <td align="center">
            <router-link v-bind:to="{ name: 'showpost', params: { id: block.id } }">{{ block.id }}</router-link>
          </td>
          <td align="center">
            <router-link v-bind:to="{ name: 'showminer', params: { id: block.miner_address } }">{{ block.miner_address }}</router-link>
          </td>
          <td align="center">
            <router-link v-bind:to="{ name: 'showminer', params: { id: block.trxs.length } }">{{ block.trxs.length }}</router-link>
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
  name: 'blocks',
  data () {
    return {
      blocks: []
    }
  },
  mounted () {
    this.getBlocks()
  },
  methods: {
    async getBlocks () {
      const response = await BlocksService.fetchBlocks()
      this.blocks = response.data
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
