<template>

  <div id="app">

    <div id="header">
      <a class="logoLink" href="https://webdollar.network">
        <img src="static/webd.gif" alt="webDollar logo" id="logo" title="webDollar logo" />
      </a>
      <a class="webdollar-explorer-link" href="#/">
        WebDollar Explorer
      </a>
      <status></status>
      <website-menu></website-menu>
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

import Status from '@/components/utils/Status.vue'
import WebsiteMenu from '@/components/utils/Menu.vue'
import Search from '@/components/utils/Search.vue'

export default {

  name: 'App',

  components: { Status, Search, WebsiteMenu },

  data () {
    return {
    }
  },

  methods: {
  }

}

</script>

<style>

  @media screen and (max-width: 900px) {

    .webdollar-explorer-link {

    }

  }

</style>

<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link id="WebdollarFont" href="https://webdollar.io/public/assets/fonts/avenir-light.woff" rel="stylesheet">
