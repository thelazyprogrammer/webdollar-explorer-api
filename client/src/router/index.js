import Vue from 'vue'
import Router from 'vue-router'
import Blocks from '@/components/Blocks'

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
  ]
})
