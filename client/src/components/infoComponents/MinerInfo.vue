<template>
  <div >
    <div v-if="miner" class="minerTable">

      <div style="display: block;text-align:center; height: 58px;">
        <img style="width:50px; height:50px; margin-bottom: -15px" :src="'https://robohash.org/' + encodeURIComponent(miner.address) + '?set=set4&size=50x50'" />
        <span style="font-size: 0.9em;"> {{getLabel(miner.address)}} </span>
        <span style="font-size: 0.9em; color: #fec02c!important"> {{ miner.address }} </span>
        <a title="Star network" class="webdAddress" :href="'#/stars/' + miner.address">&#9734;</a>
        <span v-clipboard:success="onCopy" v-clipboard:copy="miner.address" title="Copy address to clipboard" style="cursor: pointer; color: #fec02c!important; padding: 0px;"> &Xi; </span> <span style="font-size: xx-small; color: #fec02c!important;" :class="copyTextClass"> {{copyText }}</span>
      </div>

      <div>
        <span>
          Balance
        </span>
        <span>
          {{ this.formatMoneyNumber(miner.balance*10000,4) }} <span v-if="miner.balance > 100000" title='Percentage of the Total Supply'>[{{ this.formatSupplyRatio(this.miner.total_supply_ratio) }}%] </span>
         </span>
      </div>

      <div v-if="miner.miner_balance">
          <span>
            Mined
          </span>
        <span v-if="miner.miner_balance">
          {{ this.formatMoneyNumber(miner.miner_balance*10000,4) }}
        </span>
      </div>

      <div v-if="miner.miner_balance_pow && miner.miner_balance != miner.miner_balance_pow">
          <span>
            PoW mined
          </span>
        <span>
          {{ this.formatMoneyNumber(miner.miner_balance_pow*10000,4) }}
        </span>
      </div>

      <div v-if="miner.miner_balance_pos">
          <span>
            PoS mined
          </span>
        <span>
          {{ this.formatMoneyNumber(miner.miner_balance_pos*10000,4) }}
        </span>
      </div>

      <div v-if="miner.miner_balance_res">
          <span>
            PoS resolved
          </span>
        <span>
          {{ this.formatMoneyNumber(miner.miner_balance_res*10000,4) }}
        </span>
      </div>

      <div v-if="miner.trx_to_balance">
          <span>
            Sent
          </span>
        <span>
            {{ this.formatMoneyNumber(miner.trx_to_balance*10000,4) }}
          </span>
      </div>

      <div v-if="miner.trx_from_balance">
          <span>
            Received
          </span>
        <span>
            {{ this.formatMoneyNumber(miner.trx_from_balance*10000,4) }}
          </span>
      </div>

      <div v-if="miner.balance && miner.balance > 0">
          <span class="tooltip">
            PoS estimate
            <span class="tooltiptext">The estimated amount of WEBD that you earn if you stake the current balance for a month</span>
          </span>
        <span v-if="miner.balance" class="tooltip">
          {{ this.getPossiblePoSReward(miner.balance*10000,4) }} per month
        </span>
        <span v-else> 0 </span>
      </div>

      <div v-if="miner.balance && miner.balance > 1000 && this.estimated_value && this.estimated_value_usd">
          <span>
            Value estimate
          </span>
        <span v-if="miner.balance">
          <span class="labelAddress">{{ this.formatMoneyNumber((Math.round(this.estimated_value_usd * miner.balance * 1000) / 1000) * 10000, 10000) }} USD</span>
          <span class="labelAddress">{{ this.formatMoneyNumber((Math.round(this.estimated_value * miner.balance * 1000) / 1000)*10000, 10000) }} ETH </span>
        </span>
      </div>

    </div>

    <div v-else>
      There are no blocks <br /><br />
    </div>

  </div>

</template>

<script>

import Utils from '@/services/utils'

export default {
  name: 'block',

  data () {
    return {
      copyText: 'Address copied',
      copyTextClass: 'showNoCopyMessage'
    }
  },

  props: {
    miner: { default: () => { return [] } },
    estimated_value: { default: () => { return 0 } },
    estimated_value_usd: { default: () => { return 0 } }
  },

  methods: {
    getLabel (address) {
      let label = Utils.mapAddress(address)
      if (label !== address) {
        return label
      }
    },
    formatMoneyNumber (number, decimals) {
      if (!number) {
        return 0
      }
      return Utils.formatMoneyNumber(number, decimals)
    },
    formatSupplyRatio (ratio) {
      if (ratio < 0) {
        return 0
      }
      return Math.round(ratio * 1000) / 1000
    },
    onCopy () {
      this.copyTextClass = 'showCopyMessage'
      setTimeout(function () {
        this.copyTextClass = 'showNoCopyMessage'
      }.bind(this), 2000)
    },
    getPossiblePoSReward (balance) {
      let totalDailyReward = 6000 * 60 * 60 * 24 / 40
      let daysPassed = (new Date() - new Date(1524743407 * 1000)) / (1000 * 60 * 60 * 24)
      let currSupply = (totalDailyReward * Math.round(daysPassed) + 4156801128)
      let posReward = 0.6666
      let share = posReward * totalDailyReward / currSupply
      let dailyReward = share * balance / 10000
      let monthlyReward = dailyReward * 30 * 97 / 100
      // PoS reward decreases 3% per month and 9% per year
      return this.formatMoneyNumber(monthlyReward * 10000)
    }
  }

}
</script>
<style type="text/css">

  .result{
    display: block;
    padding: 10px 0;
  }

  .blockContainer{
    border:solid 1px #5f5f5f;
    text-align: center;
    width: 600px;
    margin: 0 auto;
  }

  .title{
    border-bottom:solid 1px #5f5f5f;
  }

  .textTitle{
    width: 100%;
    background-color: #3a3a3a;
    box-sizing: border-box;
    padding: 10px 0;
    display: block;
  }

  .showNoCopyMessage {
    display: none;
  }

  .showCopyMessage {
  }
  .tooltip {
  position: relative;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 220px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -120px;
  opacity: 0;
  transition: opacity 0.3s;
}
.tooltiptext {
  color: #fec02c!important;
  text-decoration: none;
  font-size: small!important;
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}
.tooltip-right {
    top: -5px;
    left: 125%;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

</style>
