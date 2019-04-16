// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import VueAnalytics from 'vue-analytics'
import VueClipboard from 'vue-clipboard2'
import ToggleButton from 'vue-js-toggle-button'
import Slider from 'vue-slider-component'

import HighchartsVue from 'highcharts-vue'
import Highcharts from 'highcharts'
import exportingInit from 'highcharts/modules/exporting'
exportingInit(Highcharts)

let Paginate = require('vuejs-paginate')

Vue.config.productionTip = false

Vue.use(VueClipboard)
Vue.use(ToggleButton)
Vue.use(HighchartsVue)

Vue.component('paginate', Paginate)
Vue.component('vue-slider', Slider)

Vue.use(VueAnalytics, {
  id: 'UA-118897279-1',
  router
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
