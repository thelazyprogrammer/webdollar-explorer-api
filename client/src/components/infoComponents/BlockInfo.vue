<template>
  <div >

    <div v-if="block.number" class="minerTable">

      <h2>
        <router-link v-bind:to="{ name: 'Block', params: { block_id: block.number - 1 }}"> &lt;&lt; </router-link>
        Block Details
        <router-link v-bind:to="{ name: 'Block', params: { block_id: block.number + 1 }}"> &gt;&gt;  </router-link>
      </h2>

      <div>
          <span>
             Block Number
          </span>
        <span>
            <router-link v-bind:to="{ name: 'Block', params: { id: block.number }}">{{ block.number }} </router-link>
          </span>
      </div>

      <div>
          <span>
            Miner Address
          </span>
        <span>
            <a class="webdAddress" :href="'#/miner/' + block.miner">{{ block.miner }}</a>
          </span>
      </div>

      <div>
        <span>
          Block Reward
        </span>
        <span>
            {{ formatMoneyNumber(block.reward,0) }}
        </span>
      </div>

      <div>
        <span>
          Difficulty
        </span>
        <span>
          {{ getDifficulty(block.hash) }}
        </span>
      </div>

      <div>
          <span>
            Timestamp
          </span>
        <span>
            {{ block.timestamp }}
          </span>
      </div>

      <div>
          <span>
            Transactions
          </span>
        <span v-if="block.trxs_number">
            {{ block.trxs_number }}
          </span>
        <span v-else>
            0
          </span>

      </div>

    </div>

    <div v-else class="minerTable">
      <h2> <router-link v-bind:to="{ name: 'Block', params: { block_id: block.number - 1 }}"> &lt;&lt; </router-link>
        <span class="toColor"> Block {{ block }} not found </span>
        <router-link v-bind:to="{ name: 'Block', params: { block_id: block.number + 1 }}"> &gt;&gt;  </router-link>
      </h2>
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
    },

    getDifficulty(hash) {
      for (var i=0; i < hash.length; i++) {
        if (hash[i] !== '0') {
          break
        }
      }
      return i
    },
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
