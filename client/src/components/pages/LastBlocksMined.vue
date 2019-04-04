<template>

  <div class="container">

    <h2>Blocks</h2>

    <blocks-list v-if="this.blocks" :showMiner="true" :blocks="this.blocks"></blocks-list>
      <paginate v-if="this.blocks" page="this.blocks.page_number"
            :page-count="this.blocks.pages" :click-handler="changeAddress" :prev-text="'Prev'"  :next-text="'Next'"
            :container-class="'pagination-wrapper paginatio-wrapper-last'">
      </paginate>

    <loading v-else></loading>

  </div>

</template>

<script>

import BlocksList from '@/components/lists/LightMinedBlocks.vue'
import BlocksService from '@/services/BlocksService'
import Loading from '@/components/utils/Loading'

export default {

  name: 'last_mined_blocks',

  components: { BlocksList, Loading },

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
    '$route' (to, from) {
      this.getBlocks(to.query.page_number)
    }
  },
  methods: {
    changeAddress: function (pageNum) {
      this.$router.push('/blocks?page_number=' + pageNum)
    },
    async getBlocks (pageNumber) {
      const response = await BlocksService.fetchBlocks(pageNumber)
      this.blocks = response.data.blocks
      this.blocks.page_number = response.data.page_number
      this.blocks.pages = response.data.pages
    }
  }

}
</script>
