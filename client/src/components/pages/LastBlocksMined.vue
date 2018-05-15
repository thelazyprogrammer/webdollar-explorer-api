<template>

  <div class="container">

    <h2>Last mined blocks</h2>

    <blocks-list v-if="blocks!==''" :showMiner="true" :blocks="this.blocks"></blocks-list>

    <loading v-else></loading>

  </div>

</template>

<script>

import BlocksList from '@/components/lists/LightMinedBlocks.vue'
import BlocksService from '@/services/BlocksService'
import Loading from '@/components/pages/Loading'

export default {

  name: 'last mined blocks',

  components: {BlocksList, Loading},

  data () {
    return {
      blocks: ''
    }
  },

  mounted () {
    this.getBlocks()
  },

  methods: {
    async getBlocks () {
      const response = await BlocksService.fetchBlocks()
      this.blocks = response.data
    }
  }

}
</script>

<style type="text/css">


</style>
