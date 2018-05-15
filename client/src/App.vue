<template>

  <div id="app">

    <div id="header">

      <a class="logoLink" href="https://webdollar.io">
        <img src="https://webdollar.io/public/assets/images/WebDollar-logo-white.png" alt="webDollar logo" id="logo" title="webDollar logo">
      </a>

      <search></search>

    </div>

    <router-view class="mainBox"/>

    <div id="donate">

      <p >
        Throw a web$ to help webdollar.network get better: <a href="#/miner/WEBD$gC1JvBisEYBCPEfT8rJf6B$$kBdeJHFBtz$" class="">WEBD$gC1JvBisEYBCPEfT8rJf6B$$kBdeJHFBtz$</a>
      </p>
      <p > The owner of this website disclaims any liability in connection with the integrity and use of this information.</p>
      <p > Found a bug? Report it <a href="https://github.com/thelazyprogrammer/webdollar-explorer-api">here</a>. Copyright <a href="http://lazyprogrammer.io">@lazyprogrammer.io</a> 2018</p>

    </div>

  </div>

</template>

<script>

  import Search from '@/components/utils/Search.vue'
  import BlocksService from '@/services/BlocksService'

  export default {

    name: 'App',

    components: {Search},

    data () {
      return {
        miner: [],
        searchAddress: '',
        searchStart: ''
      }
    },

    methods: {

      async getMiner (miner) {
        this.miner = []
        const response = await BlocksService.fetchMiner(miner)
        this.miner = response.data
      }
    }

  }

</script>

<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link id="WebdollarFont" href="https://webdollar.io/public/assets/fonts/avenir-light.woff" rel="stylesheet">
