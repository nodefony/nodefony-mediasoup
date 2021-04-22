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

const workerUsage = {
  ru_idrss: "integral unshared data size",
  ru_inblock: "block input operations",
  ru_isrss: "integral unshared stack size",
  ru_ixrss: "integral shared memory size",
  ru_majflt: "page faults",
  ru_maxrss: "maximum resident set size",
  ru_minflt: "page reclaims",
  ru_msgrcv: "messages received",
  ru_msgsnd: "messages sent",
  ru_nivcsw: "involuntary context switches",
  ru_nsignals: "signals received",
  ru_nswap: "swaps",
  ru_nvcsw: "voluntary context switches",
  ru_oublock: "block output operations ",
  ru_stime: "system time used",
  ru_utime: "user time used"
};

class Mediasoup extends nodefony.Service {

  constructor(settings, service) {
    super('Mediasoup', service.container, null, settings);
    this.version = mediasoupClient.version;
    this.room = null;
    this.peer = null;
    this.sock = null;
    this.domain = "localhost";
    this.workerUsage = workerUsage;
    this.deviceInfo = nodefony.browser;
    this.domain = this.options.VUE_APP_DOMAIN;
    this.portHttp = this.options.VUE_APP_HTTP_PORT;
    this.portHttps = this.options.VUE_APP_HTTPS_PORT;
    this.VIDEO_CONSTRAINS = VIDEO_CONSTRAINS;
    this.api = new nodefony.Api(this.name, {
      baseUrl: "/mediasoup/api",
      storage: {
        type: "local"
      }
    });
    this.host = window.location.host;
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
  }

  async init() {
    this.host = await this.getRemoteDomain();
    return Promise.resolve(this);
  }

  async getRemoteDomain() {
    return Promise.resolve(window.location.host);
    /*return this.api.http("/mediasoup/api/servers")
      .then((result) => {
        nodefony.extend(this.options, response.result);
        return result.result.domain.name;
      });*/
  }

  getWssUrl(roomid, peerid) {
    let uri = `/mediasoup/ws?roomId=${roomid}&peerId=${peerid}`;
    return `wss://${this.host}${uri}`;
  }

  getWssStats() {
    const uri = "ws/stats";
    return `wss://${this.host}/mediasoup/${uri}`;
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

  // websocket connect
  connect(roomid = null, peerid = null, options = {}) {
    return new Promise(async (resolve, reject) => {
      //this.domain = await this.getRemoteDomain();
      this.sock = new WebSocket(this.getWssUrl(roomid, peerid));
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
        //this.store.commit("mediasoupActivity");
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
        case "pauseProducer":
          this.fire("pauseProducer", message, this);
          break;
        case "resumeProducer":
          this.fire("resumeProducer", message, this);
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
      this.sock.onclose = (event) => {
        this.fire("closeSock", event, this);
        this.store.commit('setConnected', false);
        this.sock = null;
        this.removeAllListeners();
        return this.leaveRoom();
      };
    });
  }

  async join() {
    return await this.room.join();
  }

  initializeRoom(roomid, peerid, options){
    return new Promise((resolve, reject) => {
      try{
        if(! this.sock ){
          throw new Error(`Mediasoup not connected`);
        }
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

  connectStats(){
    return new Promise( (resolve, reject) => {
      this.sockStats = new WebSocket(this.getWssStats());
      this.sockStats.onopen = (event) => {
        this.log(`Mediasoup Websocket Connect Stats`);
        try{
          this.fire("openSock", event, this);
          return resolve(this.sockStats);
        }catch(e){
          return reject(e);
        }
      };
      this.sockStats.onmessage = (event) => {
        let message = null;
        //this.store.commit("mediasoupActivity");
        //let sendMessage = null;
        try {
          message = JSON.parse(event.data);
          this.fire("stats", message, this);
        } catch (e) {
          this.log(e, "ERROR");
          this.log(event.data, "ERROR");
          throw new Error(`Bad Json Message`);
        }
      }
      this.sockStats.onerror = (error) => {
        this.log(error, "ERROR");
        this.fire("errorSockStats", error, this);
        return reject(error);
      };
      this.sockStats.onclose = (event) => {
        this.fire("closeSockStats", event ,this);
        this.sockStats = null;
      };
    })
  }

  getCpuUsage(worker){
    let res = 0;
    if (worker &&  worker.usage) {
      let usage = worker.usage;
      let usertime = null;
      let systemtime = null;
      if (this.utime && this.stime) {
        usertime = (usage.ru_utime - this.utime) / 1000000;
        systemtime = (usage.ru_stime - this.stime) / 1000000;
        res = (usertime + systemtime) * 100000;
        //console.log(usertime, systemtime, (usertime + systemtime), res)
      }
      this.stime = usage.ru_stime;
      this.utime = usage.ru_utime
      //return ((usage.ru_utime + usage.ru_stime) * 100) / (utime + stime); // Total CPU Utilization
    }
    return res.toFixed(2);
  }
  
  getMemoryUsage(worker) {
    if (worker &&  worker.usage) {
      let usage = worker.usage;
      let rss = usage.ru_maxrss;
      let units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        n = parseInt(rss, 10) || 0,
        l = 0;
      while (n >= 1024) {
        n = n / 1024;
        l++;
      }
      return `${n.toFixed(2)} ${units[l]}`;
      //return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
    }
    return undefined;
  }

}

export default new Mediasoup(process.env, nodefony.kernel);
