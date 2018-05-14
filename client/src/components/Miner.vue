<template>
  <div class="blocks">
    <div id="search_wrapper">
        <div style="display: inline;float:left;" >
          <input v-model="searchAddress" id="searchBox" v-on:enter="onSearchAddress" type="text" placeholder="Search by WEBD Address" style="float:left;width: 330px; height: 31px;float:left;" autocomplete="off">
          <button v-model="searchStart" v-on:click="onSearchAddress" type="submit" style="padding: 3px 6px 3px 6px; height: 37px; width: 41px; border:0px;cursor:pointer;margin-left: -3px; margin-top: 0px;float:left;background: #4d7ef7; color: #fff;">GO</button>
        </div>
    </div>
    <div id="address" v-if="miner && miner.address" class="table-wrap">
      <p style="float:left; align:left;text-align: left; height: 10px;width: 100%;"> WEBD address:  <a :href="'#/miner/' + miner.address">{{ miner.address }}</a></p>
      <p style="float:left; width: 100%;text-align: left;"> WEBD balance: {{ miner.balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Mined amount: {{ miner.miner_balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Transactions sent amount: {{ miner.trx_to_balance }}</p>
      <p style="float:left; width: 100%;text-align: left;"> Transactions received amount: {{ miner.trx_from_balance }}</p>
      <p v-if="miner.blocks && miner.blocks.length" style="float:left; width: 100%;text-align: left;"> Blocks mined: {{ miner.blocks.length }}</p>
      <p v-if="miner.transactions && miner.transactions.length" style="float:left; width: 100%;text-align: left;"> Transactions: {{ miner.transactions.length }}</p>
      <h2 style="float:left;width:100%;" v-if="miner.transactions && miner.transactions.length">Transactions</h2>
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
      <h2 style="float:left;width:100%;" v-if="miner.blocks && miner.blocks.length">Mined blocks</h2>
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
    <div id="loader" v-else style="float:left;width:100%; margin-top:10px;">
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
    </div>
  </div>
</template>

<script>
import BlocksService from '@/services/BlocksService'
export default {
  name: 'miner',
  data () {
    return {
      miner: [],
      searchAddress: '',
      searchStart: ''
    }
  },
  beforeRouteUpdate (to) {
    this.getMiner(to.params.miner_address)
  },
  mounted () {
    this.miner = []
    this.getMiner(window.location.href.substring(34,window.location.href.length))
  },
  methods: {
    async getMiner (miner) {
      this.miner = []
      const response = await BlocksService.fetchMiner(miner)
      this.miner = response.data
    },
    async onSearchAddress (event) {
       this.getMiner(this.searchAddress)
    }
    
  }
}
</script>

<style type="text/css">
#search_wrapper {
  float:left;
  width:80%;
}

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

.spinner {
  width: 40px;
  height: 40px;

  position: relative;
  margin: 100px auto;
}

.double-bounce1, .double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #333;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  
  -webkit-animation: sk-bounce 2.0s infinite ease-in-out;
  animation: sk-bounce 2.0s infinite ease-in-out;
}

.double-bounce2 {
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

@-webkit-keyframes sk-bounce {
  0%, 100% { -webkit-transform: scale(0.0) }
  50% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bounce {
  0%, 100% { 
    transform: scale(0.0);
    -webkit-transform: scale(0.0);
  } 50% { 
    transform: scale(1.0);
    -webkit-transform: scale(1.0);
  }
}
</style>
