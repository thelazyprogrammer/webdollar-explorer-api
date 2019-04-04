import Vue from 'vue'
import Router from 'vue-router'
import Blocks from '@/components/pages/LastBlocksMined'
import Block from '@/components/pages/Block'
import Miner from '@/components/pages/Miner'
import Search from '@/components/utils/Search'
import Fame from '@/components/pages/Fame'
import Pools from '@/components/pages/Pools'
import Genesis from '@/components/pages/Genesis'
import OldGenesis from '@/components/pages/OldGenesis'
import Stars from '@/components/pages/Stars'
import pendingTransactions from '@/components/pages/PendingTransactions'
import webdToday from '@/components/pages/WebdToday'
import Forks from '@/components/pages/Forks'
import Transactions from '@/components/pages/Transactions'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: webdToday
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
      path: '/old-genesis',
      name: 'OldGenesis',
      component: OldGenesis
    },
    {
      path: '/stars/:address',
      name: 'Stars',
      component: Stars
    },
    {
      path: '/pending_trx',
      name: 'Pending Transactions',
      component: pendingTransactions
    },
    {
      path: '/today',
      name: 'WEBD Today',
      component: webdToday
    },
    {
      path: '/forks',
      name: 'Forkmon',
      component: Forks
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions
    }
  ]
})
