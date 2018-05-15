<template>

  <div id="search_wrapper">
    <input v-model="searchAddress" id="searchBox" v-on:enter="onSearchAddress" type="text" placeholder="Search by Address/Block" autocomplete="off">
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
      this.miner = [];
      const response = await BlocksService.fetchMiner(miner);
      this.miner = response.data;
    },

    async onSearchAddress (event) {

      if (this.searchAddress.indexOf("WEBD")>=0){
        await this.getMiner(this.searchAddress);
        this.$router.push({ path: `/miner/`+this.miner.address });
      }else{
        this.$router.push({ path: `/blocks/`+this.searchAddress });
      }

      this.searchAddress = '';

    }

  }

}
</script>
