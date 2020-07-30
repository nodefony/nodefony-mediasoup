import nodefony from 'nodefony';
//import nodefony from '@/../../../nodefony-core/src/nodefony';

import snackBar from './notify/snackbar';
import alert from './notify/alert';

class Nodefony extends nodefony.Service {
  constructor(settings) {
    super('kernel', null, null, settings);
    this.initSyslog();
    this.set("kernel", this);
    this.debug = this.options.VUE_APP_DEBUG;
    this.environment = this.options.VUE_APP_NODE_ENV;
    this.vueVersion = this.options.VUE_APP_VUE_VERSION;
    this.vuetifyVersion = this.options.VUE_APP_VUETIFY_VERSION;
    this.version = nodefony.version;
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
  }

  initSyslog(options = null) {
    const defaultOptions = {
      severity: {
        operator: '<=',
        data: '7'
      }
    };
    return this.syslog.listenWithConditions(this, options || defaultOptions,
      (pdu) => {
        this.parse(pdu);
        const message = pdu.payload;
        const date = new Date(pdu.timeStamp);
        let wrapper = nodefony.Service.logSeverity(pdu.severityName, typeof message);
        if (typeof message === "object") {
          wrapper(`${date.toDateString()} ${date.toLocaleTimeString()} ${pdu.severityName} ${pdu.msgid} :`);
          console.dir(message);
          return pdu;
        }
        wrapper(`${date.toDateString()} ${date.toLocaleTimeString()} ${pdu.severityName} ${pdu.msgid} : ${message}`);
        return pdu;
      });
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
nodefony.kernel = new Nodefony(process.env);


export default nodefony.kernel;
