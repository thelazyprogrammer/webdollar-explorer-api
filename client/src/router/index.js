import Vue from 'vue'
import Router from 'vue-router'
import Blocks from '@/components/pages/LastBlocksMined'
import Block from '@/components/pages/Block'
import Miner from '@/components/pages/Miner'
import Search from '@/components/utils/Search'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Blocks',
      component: Blocks
    },
    {
      path: '/blocks',
      name: 'Blocks',
      component: Blocks
    },
    {
      path: '/blocks/:block_id',
      name: 'Block',
      component: Block
    },
    {
      path: '/miner/:miner_address*',
      name: 'Miner',
      component: Miner
    },
    {
      path: '/search/:miner_address',
      name: 'Search',
      component: Search
    },
  ]
})
