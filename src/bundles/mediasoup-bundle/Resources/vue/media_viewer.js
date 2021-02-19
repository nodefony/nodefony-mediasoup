import nodefonyclient from 'nodefony-client';
import SocketBinding from './mediaviewer/socketBinding.js';

class MediaPlugin extends nodefonyclient.Service {
  constructor(options = {}) {
    super("media_viewer", null, null, options);
    this.version = "1.0.0";
    this.socket = null;
  }

  // hooy plugins vue
  install (Vue, options) {
    this.Vue = Vue ;
    Vue.prototype.$media_viewer = this;
    this.container = options.nodefony.container;
    this.syslog = this.get("syslog");
    this.socketBinding = new SocketBinding(this);
    this.log(`Add Plugin media_viewer : ${this.version}`,"INFO");
  }

  async connect(url) {
    return new Promise((resolve, reject)=> {
      const socket = new WebSocket( url );

      socket.onopen = ( event ) => {
        this.socket = socket;
        this.fire("onSocketOpen", this.socket);
        return resolve(this.socket);
      };

      socket.onerror = (error) => {
        this.fire("onError", error, this);
        return reject(error);
      };

      socket.onmessage = async (message) => {
        let result = null;
        try {
          result = JSON.parse(message.data);
          return await this.socketBinding.onSocketMessage(result);
        } catch(e) {
          this.fire("onError", e, this);
          throw e;
        }
      };

      socket.onclose = (event) => {
        this.socket = null;
        this.fire("onSocketClose", event, this);
      };
      return socket;
    });
  }

  isSocketClosed() {
    return !this.socket;
  }

  close() {
    if (this.socket) {
      this.socket.close();
    }
  }

}
export default new MediaPlugin(process.env);
