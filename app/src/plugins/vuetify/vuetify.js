import Vue from 'vue';

//import Vuetify from 'vuetify/lib';
/*import Vuetify, {
  VCard,
  VToolbar
} from 'vuetify/lib'*/

import Vuetify from 'vuetify/lib/framework' ;

//import { Ripple } from 'vuetify/lib/directives'

Vue.use(Vuetify, {


})

Vue.use(Vuetify);

export default  (i18n) =>{
  const opts = {
    lang: {
      t: (key, ...params) => i18n.t(key, params)
    }
  }
  return new Vuetify(opts);
}
