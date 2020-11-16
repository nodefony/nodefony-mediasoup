import nodefony from 'nodefony-client'
import media from "nodefony-client/dist/medias";
media(nodefony);
import webaudio from "nodefony-client/dist/webaudio";
webaudio(nodefony);
import socket from "nodefony-client/dist/socket";
socket(nodefony);
import sip from "nodefony-client/dist/sip";
sip(nodefony);
//nodefony.showBanner();

import snackBar from './notify/snackbar';
import alert from './notify/alert';

class Nodefony extends nodefony.Kernel {
  constructor(name, settings) {
    if(typeof settings.VUE_APP_DEBUG === "string"){
      if (settings.VUE_APP_DEBUG === "false"){
        settings.VUE_APP_DEBUG = false;
      }
      if (settings.VUE_APP_DEBUG === "true"){
        settings.VUE_APP_DEBUG = true;
      }
    }
    settings.environment = settings.VUE_APP_NODE_ENV;
    settings.debug = settings.VUE_APP_DEBUG ;
    settings.version = nodefony.version;
    super(name, settings);
    this.vueVersion = this.options.VUE_APP_VUE_VERSION;
    this.vuetifyVersion = this.options.VUE_APP_VUETIFY_VERSION;
    this.domain = this.options.VUE_APP_DOMAIN;
  }

  // hooy plugins vue
  install(Vue, options) {
    this.store = options.store;
    this.router = options.router;
    this.vuetify = options.vuetify;
    this.i18n = options.i18n;
    this.vue = Vue;
    Vue.prototype.$nodefony = this;
    Vue.prototype.log = (...args) => {
      return this.log(...args);
    };
    Vue.prototype.notify = (...args) => {
      return this.notify(...args);
    };
    this.log(`Add Plugin nodefony : ${this.version}`, "INFO");
    this.log(`Nodefony Domain : ${this.domain}`);
  }

  parse(pdu, element) {
    switch (true) {
    case pdu.severity <= 3:
      pdu.type = 'error';
      pdu.color = 'red';
      break;
    case pdu.severity === 4:
      pdu.type = 'warning';
      pdu.color = 'yellow';
      break;
    case pdu.severity === 5:
      pdu.type = 'info';
      pdu.color = 'blue';
      break;
    case pdu.severity === 6:
      pdu.type = 'success';
      pdu.color = 'green';
      break;
    case pdu.severity === 7:
      pdu.type = 'success';
      pdu.color = 'teal';
      break;
    default:
      pdu.type = 'info';
      pdu.color = 'teal';
    }
    return pdu;
  }

  notify(pdu, type = "snackBar", element = null, options = {}) {
    let container = null;
    if (!element) {
      container = document.getElementById("container");
    } else {
      container = element;
    }
    if (!container) {
      container = document.body;
    }
    this.parse(pdu);
    options.pdu = pdu;
    let ComponentClass = null;
    switch (type) {
    case "alert":
      ComponentClass = this.vue.extend(alert);
      break;
    case "snackBar":
    default:
      ComponentClass = this.vue.extend(snackBar);
    }
    const component = new ComponentClass({
      //$i18n: this.i18n,
      /*data: {
        pdu: pdu
      },*/
      propsData: options
    });
    component.$mount();
    container.appendChild(component.$el);
    return component;
  }

}
nodefony.kernel = new Nodefony("KERNEL",process.env);

export default nodefony.kernel;
