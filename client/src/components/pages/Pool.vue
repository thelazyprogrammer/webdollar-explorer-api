<template>
  <div class="pools">
    <div id="address" v-if="miner && miner.address" class="table-wrap">
     <miner-info :estimated_value="this.estimated_value" :estimated_value_usd="this.estimated_value_usd" :miner="this.miner"></miner-info>
    </div>
  </div>

</template>

<script>
import SpecialAddresses from '@/services/SpecialAddresses'
import BlocksService from '@/services/BlocksService'
import MinerInfo from '@/components/infoComponents/MinerInfo.vue'

export default {
  name: 'pools',

  components: { MinerInfo },

  beforeRouteUpdate (to) {
    this.getPool(to.params.pool_name)
  },
  mounted () {
    this.getPool()
  },
  methods: {
    async getPool (poolName) {
      if (!poolName) {
        poolName = this.$route.params.pool_name
        console.log(poolName)
      }
      this.pool_data = await this.getPoolData(poolName)
      if (this.pool_data) {
        this.getMiner(this.pool_data.address)
      }
    },
    async getPoolData (poolName) {
      for (let i = 0; i <= this.pools.length; i++) {
        if (this.pools[i].name === poolName) return this.pools[i]
      }
    },
    async getMiner (miner, startDate, endDate) {
      this.miner = {}
      let minerTask = BlocksService.fetchMiner(miner, false, startDate, endDate)

      let minerData = await minerTask
      this.miner = minerData.data
    }
  },
  data () {
    return {
      miner: { default: function () { return { } } },
      estimated_value: 0,
      estimated_value_usd: 0,
      pools: SpecialAddresses.pools.sort(function (a, b) {
        let mapStatus = {
          up: -1,
          down: 1
        }
        return mapStatus[a.status] - mapStatus[b.status]
      }),
      pool_data: ''
    }
  }
}
</script>
<style type="text/css">

</style>
