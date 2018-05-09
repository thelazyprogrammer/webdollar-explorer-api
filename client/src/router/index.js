import Vue from 'vue'
import Router from 'vue-router'
import Blocks from '@/components/Blocks'
import Block from '@/components/Block'
import Miner from '@/components/Miner'

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
  ]
})
