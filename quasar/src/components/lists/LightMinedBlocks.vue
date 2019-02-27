<template>

  <div>

   <q-list padding>
      <q-item dense active class="text-weight-bold">
        <q-item-section side top>
          <q-item-label style="width: 40px;" >No.</q-item-label>
        </q-item-section>

        <q-item-section :inset-level="1" side top>
          <q-item-label style="width: 120px;">Miner</q-item-label>
        </q-item-section>

        <q-item-section right top>
          <q-item-label>Age</q-item-label>
        </q-item-section>
      </q-item>
      <q-separator bordered />

      <q-item dense active spaced v-bind:key="block.number" v-for="block in blocks">
        <q-item-section side top>
          <q-item-label caption lines="2">{{block.number}}</q-item-label>
        </q-item-section>

        <q-item-section :inset-level="1" side top>
          <q-item-label caption lines="2" style="font-family: 'avenir',monospace;width: 120px;" >{{mapAddress(block.miner)}}</q-item-label>
        </q-item-section>

        <q-item-section right top>
          <q-item-label caption>{{ formatDate(block.timestamp, showMiner) }}</q-item-label>
        </q-item-section>
      </q-item>

    </q-list>
  </div>

</template>

<script>

import Utils from '@/services/utils'
import BlocksService from '@/services/BlocksService'

var moment = require('moment');

export default {

  name: 'transactions',
  props:{
    blocks:{ default:()=>{return [] }},
    pages: { default:()=>{return 1 }},
    page_number: { default:()=>{return 1 }},
    showMiner: { default: true }
  },

  methods: {
    changeAddress: function(pageNum) {
      this.$router.push('/blocks?page_number=' + pageNum)
    },
    mapAddress(address) {
      return Utils.mapAddress(address)
    },
    formatMoneyNumber(number, decimals){
      return Utils.formatMoneyNumber(number, decimals);
    },
    formatDate(timestamp, showMiner){
      let blockDate = new Date(timestamp * 1000)
      let fromNow = moment(blockDate).fromNow()
      if (showMiner) {
        return fromNow
      } else {
        return fromNow + " (" + blockDate.toGMTString() +  ")"
      }
    }
  }

}
</script>
<style>

</style>
