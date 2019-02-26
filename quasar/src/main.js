import Vue from 'vue'
import App from './App.vue'

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
  QHeader,
  QFooter,
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
} from 'quasar'

Vue.use(Quasar, {
  config: {
    brand: {
      primary: '#292828',
      secondary: '#404040',
      accent: '#fec02c',

      positive: '#00c000',
      negative: '#da6654',
      info: '#fff',
      warning: '#fec02c'
    }
  },
  components: {
    QLayout,
    QFooter,
    QAvatar,
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
  render: h => h(App),
}).$mount('#app')
