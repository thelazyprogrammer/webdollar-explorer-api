<template>
      <q-list>
        <q-item-label header>Menu</q-item-label>
        <q-item clickable tag="a" href="https://v1.quasar-framework.org">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>WEBD Today</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
</template>

<script>
export default {
  name: 'Menu'
}
</script>
