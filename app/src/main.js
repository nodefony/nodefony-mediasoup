import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import i18n from './i18n'
import nodefony from '@/plugins/nodefony/nodefony'
import mediasoup from '@/plugins/mediasoup/mediasoup'
import './registerServiceWorker'

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
  render: h => h(App)
}).$mount('#app')
