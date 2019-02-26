<template>
      <q-list>
        <q-item-label header>Menu</q-item-label>
        <q-item clickable tag="a" href="#/today">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>WEBD Today</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/pending_trx">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Pending Transactions</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/blocks">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Blocks</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/pools">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Pools</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/genesis">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Genesis</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable tag="a" href="#/fame">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Hall of Fame</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
</template>

<script>
export default {
  name: 'Menu'
}
</script>
