import Vue from 'vue'
import App from './App.vue'
import Router from './router/routes.js'
import VueAnalytics from 'vue-analytics'
import Slider from 'vue-slider-component'
let Paginate = require('vuejs-paginate')
import VueClipboard from 'vue-clipboard2'
import ToggleButton from 'vue-js-toggle-button'

import './styles/quasar.styl'
import 'quasar/dist/quasar.ie.polyfills'
import lang from 'quasar/lang/en-us.js'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/mdi-v3/mdi-v3.css'
import '@quasar/extras/eva-icons/eva-icons.css'
import {
  Quasar, 
  QLayout,
  QAvatar,
  QAjaxBar,
  QHeader,
  QFooter,
  QDrawer,
  QPageContainer,
  QPage,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QBreadcrumbs,
  QBreadcrumbsEl,
  QIcon,
  QList,
  QItem,
  QItemSection,
  QItemLabel,
} from 'quasar'

Vue.use(VueClipboard)
Vue.use(ToggleButton)

Vue.use(VueAnalytics, {
      id: 'UA-118897279-1',
      Router
})
Vue.component('paginate', Paginate)
Vue.component('vue-slider', Slider)

Vue.use(Quasar, {
  config: {
  },
  components: {
    QBreadcrumbs,
    QBreadcrumbsEl,
    QLayout,
    QFooter,
    QAvatar,
    QAjaxBar,
    QHeader,
    QDrawer,
    QPageContainer,
    QPage,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QItem,
    QItemSection,
    QItemLabel,
  },
  directives: {
  },
  plugins: {
  },
  lang: lang
 })

Vue.config.productionTip = false

new Vue({
    router: Router,
  render: h => h(App),
}).$mount('#app')
