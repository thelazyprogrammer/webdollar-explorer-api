<template>

  <div id="search_wrapper">
    <input v-model="searchAddress" id="searchBox" v-on:enter="onSearchAddress" type="text" placeholder="Search by WEBD Address" autocomplete="off">
    <button v-model="searchStart" v-on:click="onSearchAddress" type="submit">GO</button>
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
    this.getMiner(window.location.href.substring(34,window.location.href.length))
  },

  methods: {

    async getMiner (miner) {
      const response = await BlocksService.fetchMiner(miner)
      this.miner = response.data
    },

    async onSearchAddress (event) {
       this.getMiner(this.searchAddress)
    }

  }

}
</script>
