import Vue from 'vue'
import VueI18n from 'vue-i18n'
//vuetify
import en_vuetify from './vuetify/en'
import fr_vuetify from './vuetify/fr'
const i18n_vuetify = {
  fr: {
    ...fr_vuetify
  },
  en: {
    ...en_vuetify
  }
}

Vue.use(VueI18n)

function loadLocaleMessages() {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {};
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
      if (locale in i18n_vuetify) {
        messages[locale].$vuetify = i18n_vuetify[locale]
      }
    }
  })
  return messages
}

const LOCALE = window.sessionStorage.getItem("locale");
const LOCALE_DEFAULT = 'en';

export default new VueI18n({
  locale: LOCALE || process.env.VUE_APP_I18N_LOCALE || LOCALE_DEFAULT,
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || LOCALE_DEFAULT,
  messages: loadLocaleMessages()
})
