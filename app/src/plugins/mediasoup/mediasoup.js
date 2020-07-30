import nodefony from 'nodefony';

import * as mediasoupClient from 'mediasoup-client';

class Mediasoup extends nodefony.Service {

  constructor(settings){
    super('Mediasoup', null, null, settings);
    this.version = mediasoupClient.version;
    this.client = mediasoupClient ;
  }

  // hooy plugins vue
  install(Vue, options) {
    Vue.prototype.$mediasoup = this;
    this.vue = Vue;
    this.store = options.store ;
    this.router = options.router;
    this.i18n = options.i18n;
    this.container = options.nodefony.container ;
    this.syslog = this.container.get("syslog");
    this.log(`Add Plugin mediasoup : ${this.version}`, "INFO");
  }

  connect(){
    const exampleSocket = new WebSocket("wss://localhost:5152/mediasoup/ws?roomId=eee&peerId=cci");
    exampleSocket.onopen =  (event) =>{
      exampleSocket.send("sbobobobob");
    }
    exampleSocket.onmessage =  (event) =>{
      this.log(event.data,"DEBUG", 'WebSocket message')
    }
  }

}

export default new Mediasoup(process.env);
