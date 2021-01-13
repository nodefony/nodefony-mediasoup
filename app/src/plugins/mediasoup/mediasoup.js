import nodefony from 'nodefony-client';
import * as mediasoupClient from 'mediasoup-client';
import Room from './room.js';
import Peer from './peer.js';

const VIDEO_CONSTRAINS = {
  qvga: {
    width: {
      ideal: 320
    },
    height: {
      ideal: 240
    }
  },
  vga: {
    width: {
      ideal: 640
    },
    height: {
      ideal: 480
    }
  },
  hd: {
    width: {
      ideal: 1280
    },
    height: {
      ideal: 720
    }
  }
};

class Mediasoup extends nodefony.Service {

  constructor(settings, service) {
    super('Mediasoup', service.container, null, settings);
    this.version = mediasoupClient.version;
    this.room = null;
    this.peer = null;
    this.sock = null;
    this.domain = "localhost";
    this.deviceInfo = nodefony.browser;
    this.domain = this.options.VUE_APP_DOMAIN;
    this.portHttp = this.options.VUE_APP_HTTP_PORT;
    this.portHttps = this.options.VUE_APP_HTTPS_PORT;
    this.VIDEO_CONSTRAINS = VIDEO_CONSTRAINS;
    this.api = new nodefony.Api(this.name, {
      baseUrl: "/mediasoup/api"
    });
    //this.init();
  }

  request(...args) {
    return this.api.http(...args)
      .then((result) => {
        if (result.error) {
          throw result.error;
        }
        return result;
      })
      .catch(async (e) => {
        if (e.response) {
          if (e.response.code === 401) {
            try {
              await this.store.dispatch("AUTH_LOGOUT");
            } catch (e) {
              this.log(e, "ERROR");
              throw e.response;
            } finally {
              this.router.push("home");
            }
          }
          throw e.response;
        } else {
          throw e;
        }
      });
  }

  // hooy plugins vue
  install(Vue, options) {
    Vue.prototype.$mediasoup = this;
    this.vue = Vue;
    this.store = options.store;
    this.router = options.router;
    this.i18n = options.i18n;
    this.container = options.nodefony.container;
    this.syslog = this.get("syslog");
    this.set("store", this.store);
    this.set("router", this.router);
    this.set("i18n", this.i18n);
    this.log(`Add Plugin mediasoup : ${this.version}`, "INFO");
    this.log(`https://${this.domain}:${this.portHttps}`)
  }

  async init() {
    return await this.api.http("/mediasoup/api/servers")
      .then((response) => {
        nodefony.extend(this.options, response.result);
        return response;
      })
      .catch(e => {
        throw e;
      })
  }

  send(method, data = {}) {
    let message = JSON.stringify({
      method: method,
      roomid: this.room.id,
      peerid: this.peer.id,
      data: data
    });
    return this.sock.send(message);
  }

  async getWssServer() {
    return this.api.http("/mediasoup/api/servers")
      .then((result) => {
        return result.result.domain.name;
      });
  }

  getWssUrl() {
    return `wss://${this.domain}:${this.portHttps}/mediasoup/ws`;
  }

  getWssWaitingUrl() {
    return `wss://${this.domain}:${this.portHttps}/mediasoup/waiting`;
  }

  // websocket waiting
  /*waiting(roomid = null, peerid = null) {
    return new Promise(async (resolve, reject) => {
      this.domain = await this.getWssServer();
      const url = `wss://${this.domain}:5152/mediasoup/waiting?roomId=${roomid}&peerId=${peerid}`;
      this.sock = new WebSocket(url);
      this.sock.onopen = (event) => {
        this.log(`Mediasoup Websocket Waiting  connection peer ${peerid} room : ${roomid}`);
        this.fire("waitingHandshake", this.sock);
        return resolve(this.sock);
      }
      this.sock.onmessage = (event) => {
        let message = null;
        try {
          message = JSON.parse(event.data);
          this.fire("waiting", message, this);
        } catch (e) {
          this.log(e, "ERROR");
          this.log(event.data, "ERROR");
          throw new Error(`Bad Json Message`);
        }
      };
      this.sock.onerror = (error) => {
        this.log(error, "ERROR");
        return reject(error);
      };
      this.sock.onclose = (event) => {
        this.fire("closeSock", event, this.sock);
        this.sock = null;
        this.removeAllListeners("waiting");
        return;
      };

    });
  }*/

  // websocket connect
  connect(roomid = null, peerid = null, options = {}) {
    return new Promise(async (resolve, reject) => {
      this.domain = await this.getWssServer();
      const url = `wss://${this.domain}:5152/mediasoup/ws?roomId=${roomid}&peerId=${peerid}`;
      this.sock = new WebSocket(url);
      this.sock.onopen = (event) => {
        this.log(`Mediasoup Websocket Connect peer ${peerid} room : ${roomid}`);
        try{
          this.fire("openSock", event, this);
          this.store.commit('setConnected', true);
          return resolve(this.sock);
        }catch(e){
          return reject(e);
        }
      };
      this.sock.onmessage = (event) => {
        let message = null;
        //let sendMessage = null;
        this.store.commit("mediasoupActivity");
        try {
          message = JSON.parse(event.data);
        } catch (e) {
          this.log(e, "ERROR");
          this.log(event.data, "ERROR");
          throw new Error(`Bad Json Message`);
        }
        switch (message.method) {
        case "notify":
          this.fire("notify", message, this);
          break;
        case "waiting":
          this.fire("waiting", message, this);
          break;
        case "getRouterRtpCapabilities":
          this.fire("routerRtpCapabilities", message, this);
          break;
        case "createWebRtcTransport":
          this.fire("createWebRtcTransport", message, this);
          break;
        case "connectWebRtcTransport":
          this.fire("connectWebRtcTransport", message, this);
          break;
        case "join":
          this.fire("join", message, this);
          break;
        case "produce":
          this.fire("produce", message, this);
          break;
        case "produceData":
          this.fire("produceData", message, this);
          break;
        case "newDataConsumer":
          this.fire("newDataConsumer", message, this);
          break;
        case "newConsumer":
          this.fire("newConsumer", message, this);
          break;
        default:
          this.fire("message", message, this);
          return;
        }
      };
      this.sock.onerror = (error) => {
        this.log(error, "ERROR");
        this.fire("errorSock", error, this);
        return reject(error);
      };
      this.sock.onclose = () => {
        this.fire("closeSock", this);
        this.store.commit('setConnected', false);
        this.sock = null;
        this.removeAllListeners();
        return this.leaveRoom();
      };
    });
  }

  initializeRoom(roomid, peerid, options){
    return new Promise((resolve, reject) => {
      try{
        this.room = this.createRoom(roomid, options);
        this.peer = this.createPeer(peerid, options);
        const sendMessage = {
          method: "getRouterRtpCapabilities",
          roomid: roomid,
          peerid: peerid
        };
        this.sock.send(JSON.stringify(sendMessage));
        this.room.init(this.peer);
        return resolve({
          room:this.room,
          peer:this.peer,
        });
      }catch(e){
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  createPeer(peerid, options = {}) {
    return new Peer(peerid, options, this);
  }

  createRoom(roomid, options = {}) {
    return new Room(roomid, options, this);
  }

  async leaveRoom() {
    this.removeAllListeners();
    try {
      if (this.peer) {
        this.peer.close();
      }
      if (this.room) {
        await this.room.close();
      }
      delete this.room;
      delete this.peer;
      this.room = null;
      this.peer = null;
      if (this.sock) {
        this.log(`Close socket Mediasoup`);
        this.sock.close();
      }
      return this;
    } catch (e) {
      this.log(e, "ERROR");
    }
  }

  async join() {
    return await this.room.join();
  }
}

export default new Mediasoup(process.env, nodefony.kernel);
