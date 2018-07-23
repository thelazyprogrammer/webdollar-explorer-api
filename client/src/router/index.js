import Vue from 'vue'
import Router from 'vue-router'
import Blocks from '@/components/pages/LastBlocksMined'
import Block from '@/components/pages/Block'
import Miner from '@/components/pages/Miner'
import Search from '@/components/utils/Search'
import Fame from '@/components/pages/Fame'
import Pools from '@/components/pages/Pools'
import Genesis from '@/components/pages/Genesis'
import Stars from '@/components/pages/Stars'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Landing',
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
    {
      path: '/fame',
      name: 'Fame',
      component: Fame
    },
    {
      path: '/pools',
      name: 'Pools',
      component: Pools
    },
    {
      path: '/genesis',
      name: 'Genesis',
      component: Genesis
    },
    {
      path: '/stars/:address',
      name: 'Stars',
      component: Stars
    }
  ]
})
