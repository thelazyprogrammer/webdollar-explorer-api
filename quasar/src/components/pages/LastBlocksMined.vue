<template>

  <div class="container">
        <q-breadcrumbs active-color="white" style="font-size: 16px">
          <q-breadcrumbs-el label="Home" icon="home" />
          <q-breadcrumbs-el label="Blocks" icon="" />
        </q-breadcrumbs>

    <blocks-list v-if="blocks!==''" :pages="this.pages" :showMiner="true" :blocks="this.blocks"></blocks-list>

    <loading v-else></loading>

  </div>

</template>

<script>

import BlocksList from '@/components/lists/LightMinedBlocks.vue'
import BlocksService from '@/services/BlocksService'
import Loading from '@/components/utils/Loading'

export default {

  name: 'last_mined_blocks',

  components: {BlocksList, Loading},

  data () {
    return {
      blocks: '',
      pages: 1,
      page_number: 1
    }
  },

  mounted () {
    this.getBlocks(this.$route.query.page_number)
  },
  watch: {
    '$route' (to) {
      this.getBlocks(to.query.page_number)
    }
  },
  methods: {
    async getBlocks (pageNumber) {
      const response = await BlocksService.fetchBlocks(pageNumber)
      this.blocks = response.data.blocks
      this.pages = response.data.pages
      this.page_number = response.data.page_number
    }
  }

}
</script>

