<template>
      <q-list>
        <q-item-label header>Navigation</q-item-label>
        <q-item exact :active="home" clickable tag="a" href="#/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Home</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable :active="stats" tag="a" href="#/stats">
          <q-item-section avatar>
            <q-icon name="timeline" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Stats</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable :active="pending" tag="a" href="#/pending">
          <q-item-section avatar>
            <q-icon name="fiber_new" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Pending Trx</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable :active="blocks" tag="a" href="#/blocks">
          <q-item-section avatar>
            <q-icon name="drag_indicator" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Blocks</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable :active="pools" tag="a" href="#/pools">
          <q-item-section avatar>
            <q-icon name="group_work" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Pools</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable :active="genesis" tag="a" href="#/genesis">
          <q-item-section avatar>
            <q-icon name="airplanemode_active" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Genesis</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable :active="fame" tag="a" href="#/fame">
          <q-item-section avatar>
            <q-icon name="money" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Hall of Fame</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
</template>

<script>
export default {
  name: 'Menu',
  data () {
    return {
      home: false,
      stats: false,
      pending: false,
      blocks: false,
      fame: false,
      pools: false,
      genesis: false,
    }
  },
  mounted () {
    this.setActiveRoute()
  },
  watch: {
    $route: function() {
      this.setActiveRoute()
    }
  },
  methods: {
    setActiveRoute: function() {
      this["stats"] = false
      this["home"] = false
      this["blocks"] = false
      this["fame"] = false
      this["pools"] = false
      this["genesis"] = false
      this["pending"] = false
      let currRoute = this.$route.path.replace("/","")
      if (!currRoute) currRoute = "home"
      this[currRoute] = true
    }
  }

}
</script>
