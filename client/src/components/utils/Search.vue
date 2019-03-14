<template>

  <div id="search_wrapper">
    <input v-model="searchAddress" id="searchBox" v-on:keyup.enter="onSearchAddress" type="text" placeholder="Search by Address/Block" autocomplete="off">
    <button v-on:click="onSearchAddress" type="submit">GO</button>
  </div>

</template>

<script>

export default {

  name: 'search',

  data () {
    return {
      searchAddress: ''
    }
  },

  methods: {

    async onSearchAddress (event) {
      if (this.searchAddress) {
        if (this.searchAddress.indexOf('WEBD') >= 0) {
          this.$router.push({ path: `/miner/` + this.searchAddress })
          window.location.href = `#/miner/` + this.searchAddress
        } else {
          this.$router.push({ path: `/blocks/` + this.searchAddress })
        }
        setTimeout(function () {
          location.reload()
        }, 10)
      }
    }

  }

}
</script>

<style>

  #searchBox:focus{
    width: 400px;
  }

  @media screen and (max-width: 900px){

    #searchBox:focus{
      width: 200px;
    }

  }

  @media screen and (max-width: 700px){

    .webdollar-explorer-link{
      display: none;
    }

  }

</style>
