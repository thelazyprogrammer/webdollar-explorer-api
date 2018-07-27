<template>
  <div >

    <div v-if="miner" class="minerTable">

      <h2>Address Details</h2>

      <div>
        <span>
          Address
        </span>
        <span>
          <a class="webdAddress" :href="'#/miner/' + miner.address">{{ miner.address }}</a>
        </span>
      </div>

      <div v-if="getLabel(miner.address)">
          <span>
            Label
          </span>
        <span>
            <a class="webdAddress" :href="'#/miner/' + miner.address">{{ getLabel(miner.address) }}</a>
          </span>
      </div>

      <div>
          <span>
            Balance
          </span>
        <span>
            {{ this.formatMoneyNumber(miner.balance*10000,4) }} <span title='Percentage of the Total Supply'>[{{ this.miner.total_supply_ratio }}%] </span>
            <a title="Star network" class="webdAddress" :href="'#/stars/' + miner.address">&#9734;</a>
            <span v-clipboard:success="onCopy" v-clipboard:copy="miner.address" title="Copy address to clipboard" style="cursor: pointer; color: #fec02c!important; padding: 0px;"> &Xi; </span> <span style="font-size: xx-small; color: #fec02c!important;" :class="copyTextClass"> {{copyText }}</span>
          </span>
      </div>

      <div>
          <span>
            Total Mined amount
          </span>
        <span v-if="miner.blocks && miner.blocks.length">
          {{ this.formatMoneyNumber(miner.miner_balance*10000,4) }}
        </span>
        <span v-else> 0 </span>
      </div>

      <div>
          <span>
            Transactions sent amount
          </span>
        <span>
            {{ this.formatMoneyNumber(miner.trx_to_balance*10000,4) }}
          </span>
      </div>

      <div>
          <span>
            Transactions received amount
          </span>
        <span>
            {{ this.formatMoneyNumber(miner.trx_from_balance*10000,4) }}
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
import BlocksService from '@/services/BlocksService'

export default {
  name: 'block',

  data () {
    return {
      copyText: "Address copied",
      copyTextClass: "showNoCopyMessage"
    }
  },

  props:{
    miner: { default:()=>{return [] }}
  },

  methods: {
    getLabel(address) {
      let label = Utils.mapAddress(address)
      if (label != address) {
        return label
      }
      return
    },
    formatMoneyNumber(number, decimals) {
      if (number < 0 || !number) {
        return 0
      }
      return Utils.formatMoneyNumber(number, decimals);
    },
    onCopy() {
      console.log("Address copied")
      this.copyTextClass = "showCopyMessage"
      setTimeout(function() {
        this.copyTextClass = "showNoCopyMessage"
      }.bind(this), 2000)
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
</style>
