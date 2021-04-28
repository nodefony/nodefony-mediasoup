import Vue from 'vue';

//import Vuetify from 'vuetify/lib';
/*import Vuetify, {
  VCard,
  VToolbar
} from 'vuetify/lib'*/

import Vuetify from 'vuetify/lib/framework';

//import { Ripple } from 'vuetify/lib/directives'

Vue.use(Vuetify, {

})

export default (i18n) => {
  const opts = {
    lang: {
      t: (key, ...params) => i18n.t(key, params)
    },
    theme: {
      themes: {
        light: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        dark: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    }
  }
  return new Vuetify(opts);
}
