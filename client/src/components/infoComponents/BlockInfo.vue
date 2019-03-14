<template>
  <div >

    <div v-if="block.hash" class="minerTable">

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
            <a class="webdAddress" :href="'#/miner/' + block.miner">{{ getLabel(block.miner) }}</a>
          </span>
      </div>

      <div v-if="block.resolver && block.algorithm == 'pos'">
          <span>
            Resolver Address
          </span>
        <span>
            <a class="webdAddress" :href="'#/miner/' + block.resolver">{{ getLabel(block.resolver) }}</a>
          </span>
      </div>

      <div>
        <span>
          Block Reward
        </span>
        <span v-if="block.fee">
            {{formatMoneyNumber(block.reward,4)}} ({{ formatMoneyNumber(block.base_reward,0) }} + {{ formatMoneyNumber(block.fee, 4)}} fee)
        </span>
        <span v-else>
            {{ formatMoneyNumber(block.base_reward,4) }}
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
          Algorithm
        </span>
        <span>
          {{ block.algorithm }}
        </span>
      </div>

      <div>
          <span>
            Timestamp
          </span>
        <span>
            {{ formatDate(block.timestamp) }}
          </span>
      </div>

      <div v-if="block.from_amount">
        <span>
          Transactions amount
        </span>
        <span>
          {{ formatMoneyNumber(block.from_amount,4) }} ({{block.trxs_number}} trx)
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

export default {
  name: 'block',

  props: {
    block: { default: () => { return [] } }
  },

  methods: {

    getLabel (address) {
      return Utils.mapAddress(address)
    },
    formatMoneyNumber (number, decimals) {
      return Utils.formatMoneyNumber(number, decimals)
    },
    formatDate (timestamp) {
      let blockDate = new Date(timestamp * 1000)
      return blockDate.toGMTString()
    },
    getDifficulty (hash) {
      for (var i = 0; i < hash.length; i++) {
        if (hash[i] !== '0') {
          break
        }
      }
      return i
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
