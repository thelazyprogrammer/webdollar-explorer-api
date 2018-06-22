<template>
  <div >

    <div v-if="block" class="minerTable">

      <h2>
        Block Details
      </h2>

      <div>
          <span>
             Block number
          </span>
        <span>
            <router-link v-bind:to="{ name: 'Block', params: { id: block.id }}">{{ block.id }} </router-link>
          </span>
      </div>

      <div>
          <span>
            Miner Address
          </span>
        <span>
            <a :href="'#/miner/' + block.miner_address">{{ block.miner_address }}</a>
          </span>
      </div>

      <div>
          <span>
            Hash
          </span>
        <span v-if="block.hash" >
            {{ block.hash.substring(0,20) }}..
          </span>
      </div>

      <div>
          <span>
            Previous Hash
          </span>
        <span v-if="block.previous_hash">
            {{ block.previous_hash.substring(0,20) }}..
          </span>
      </div>

      <div>
          <span>
            Nonce
          </span>
        <span>
            {{ block.nonce }}
          </span>
      </div>

      <div>
          <span>
            Version
          </span>
        <span>
            {{ block.version }}
          </span>
      </div>

      <div>
          <span>
            Time Stamp
          </span>
        <span>
            {{ block.timestamp }}
          </span>
      </div>

      <div>
          <span>
            Transactions
          </span>
        <span v-if="block.trxs">
            {{ block.trxs.length }}
          </span>
        <span v-else>
            0
          </span>

      </div>

    </div>

    <div v-else>
      There are no blocks <br /><br />
    </div>

  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'

export default {
  name: 'block',

  props:{
    block:{ default:()=>{return [] }},
  },

  methods: {

    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    }
  }

}
</script>
<style type="text/css">

  .result{
    display: block;
    padding: 10px 0;
  }

  .blockContainer{
    border:solid 1px #5f5f5f;
    text-align: center;
    width: 600px;
    margin: 0 auto;
  }

  .title{
    border-bottom:solid 1px #5f5f5f;
  }

  .textTitle{
    width: 100%;
    background-color: #3a3a3a;
    box-sizing: border-box;
    padding: 10px 0;
    display: block;
  }

</style>
