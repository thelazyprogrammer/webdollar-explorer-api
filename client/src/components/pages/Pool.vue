<template>
  <div class="pools">
    <div id="address" v-if="miner && miner.address" class="table-wrap">
      <miner-info :estimated_value="this.estimated_value" :estimated_value_usd="this.estimated_value_usd" :miner="this.miner"></miner-info>
      <div>
        <highcharts  class="tabWrapper" :options="chartOptions"></highcharts>
      </div>
      <div>
        <div class="tabWrapper">
          <button id="button_live_miners" v-if="miner" class="w3-bar-item w3-button">Live miners ({{ miners.length }})</button>
        </div>

        <div class="liveMinersTab transactionsWrapper" id="live_miners">
          <pool-live-miners :page_number="1" :miners="miners"></pool-live-miners>
        </div>
      </div>
    </div>
    <loading v-else></loading>
  </div>

</template>

<script>
import SpecialAddresses from '@/services/SpecialAddresses'
import BlocksService from '@/services/BlocksService'
import ExchangeService from '@/services/ExchangeService'
import PoolsService from '@/services/PoolsService'
import MinerInfo from '@/components/infoComponents/MinerInfo.vue'
import PoolLiveMiners from '@/components/lists/PoolLiveMiners.vue'
import Loading from '@/components/utils/Loading'

export default {
  name: 'pools',

  components: { MinerInfo, Loading, PoolLiveMiners },

  data () {
    return {
      chartOptions: {
        chart: {
          backgroundColor: '#292828',
          zoomType: 'x'
        },
        title: {
          style: { 'color': '#fec02c' },
          text: 'Analytics'
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {
            text: 'Number'
          },
          type: 'logarithmic'
        },
        plotOptions: {
          area: {
            marker: {
              radius: 2
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1
              }
            },
            threshold: null
          }
        },
        credits: {
          enabled: false
        },
        legend: {
          itemStyle: {
            color: '#fec02c',
            fontWeight: 'normal'
          }
        },
        series: [
          {
            name: 'Amount received',
            type: 'spline',
            data: [],
            color: '#576dd7'
          },
          {
            name: 'Amount sent',
            type: 'spline',
            data: [],
            color: '#da6654'
          },
          {
            name: 'Blocks',
            type: 'spline',
            data: [],
            color: '#00c02c'
          },
          {
            name: 'Transactions',
            type: 'spline',
            data: [],
            color: '#fec02c'
          }
        ]
      },
      miner: { default: function () { return { } } },
      miners: { default: function () { return [] } },
      estimated_value: 0,
      estimated_value_usd: 0,
      pools: SpecialAddresses.pools.sort(function (a, b) {
        let mapStatus = {
          up: -1,
          down: 1
        }
        return mapStatus[a.status] - mapStatus[b.status]
      }),
      pool_data: '',
      pool_interval: ''
    }
  },

  beforeRouteUpdate (to) {
    this.getPool(to.params.pool_name)
  },
  destroyed () {
    if (this.pool_interval) {
      clearInterval(this.pool_interval)
    }
  },
  mounted () {
    this.getPool()
    if (this.pool_interval) {
      clearInterval(this.pool_interval)
    }
    var self = this
    this.pool_interval = setInterval(function () { self.getPoolLiveMiners() }, 10000)
  },
  methods: {
    async getPool (poolName) {
      if (!poolName) {
        poolName = this.$route.params.pool_name
      }
      this.pool_data = await this.getPoolData(poolName)
      if (this.pool_data) {
        this.getMiner(this.pool_data.address)
        this.getWebdValue()
        this.getPoolLiveMiners(poolName)
      }
    },
    async getPoolLiveMiners (poolName) {
      if (!poolName) {
        poolName = this.$route.params.pool_name
      }
      let poolStats = await PoolsService.fetchPoolStats(poolName)
      let poolMiners = poolStats.data || []
      if (poolStats.data && poolStats.data.miners) {
        poolMiners = poolStats.data.miners
      }
      this.miners = poolMiners.sort((a, b) => { return b.totalPOSBalance - a.totalPOSBalance })
    },
    async getPoolData (poolName) {
      for (let i = 0; i <= this.pools.length; i++) {
        if (this.pools[i].name === poolName) return this.pools[i]
      }
    },
    async getMiner (miner, startDate, endDate) {
      this.miner = {}
      let minerTask = BlocksService.fetchMiner(miner, false, startDate, endDate)
      let blockTSTask = BlocksService.fetchTSItems(miner, 'blocks')
      let trxTSTask = BlocksService.fetchTSItems(miner, 'trxs')
      let amountReceivedTSTask = BlocksService.fetchTSItems(miner, 'amount_received')
      let amountSentTSTask = BlocksService.fetchTSItems(miner, 'amount_sent')

      let minerData = await minerTask
      let blockData = await blockTSTask
      let trxData = await trxTSTask
      let amountReceived = await amountReceivedTSTask
      let amountSent = await amountSentTSTask
      this.miner = minerData.data
      this.chartOptions.series[2].data = blockData.data
      this.chartOptions.series[3].data = trxData.data
      this.chartOptions.series[0].data = amountReceived.data
      this.chartOptions.series[1].data = amountSent.data
    },
    async getWebdValue () {
      if (this.estimated_value && this.estimated_value_usd) {
        return
      }

      try {
        let valueUsd = await ExchangeService.fetchWebdValueCoinGeko('USD')
        this.estimated_value_usd = valueUsd.data.webdollar.usd
      } catch (ex) {
        console.log(ex)
      }

      try {
        let valueEth = await ExchangeService.fetchWebdValueCoinGeko('ETH')
        this.estimated_value = valueEth.data.webdollar.eth
      } catch (ex) {
        console.log(ex)
      }
    }

  }
}
</script>
<style type="text/css">

</style>
