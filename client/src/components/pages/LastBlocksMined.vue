<template>

  <div class="container">

    <h2>Last mined blocks</h2>

    <blocks-list :showMiner="true" :blocks="this.blocks"></blocks-list>

  </div>

</template>

<script>

import BlocksList from '@/components/lists/LightMinedBlocks.vue'
import BlocksService from '@/services/BlocksService'

export default {

  name: 'last mined blocks',

  components: {BlocksList},

  data () {
    return {
      blocks: []
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
