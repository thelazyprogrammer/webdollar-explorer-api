<template>
  <q-layout view="hhh lpR fFf">

    <q-header reveal class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
         <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar-framework.org/img/quasar-logo.png">
          </q-avatar>
          WebDollar Network
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <Menu />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer reveal bordered class="bg-grey-8 text-white text-center text-white">
      <Footer />
    </q-footer>

  </q-layout>
</template>

<script>
import Menu from './components/utils/Menu.vue'
import Footer from './components/utils/Footer.vue'

export default {
  name: 'LayoutDefault',

  components: {
    Menu, Footer
  },

  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  }
}
</script>
