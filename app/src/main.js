import Vue from 'vue'
import App from './App.vue'

import i18n from './i18n/i18n'
import Vuetify from './plugins/vuetify/vuetify'
const vuetify = Vuetify(i18n)
import router from './router'
import store from './store'

import nodefony from '@/plugins/nodefony/nodefony'
import mediasoup from '@/plugins/mediasoup/mediasoup'
//import apolloProvider from '@/apollo/apollo'

import './pwa/registerServiceWorker'

Vue.config.productionTip = false

Vue.use(nodefony, {
  router,
  store,
  vuetify,
  i18n
});

Vue.use(mediasoup, {
  router,
  store,
  i18n,
  nodefony
});

new Vue({
  router,
  store,
  vuetify,
  i18n,
  created: function () {
    this.$nodefony.application = this;
  },
  render: h => h(App)
}).$mount('#app');
