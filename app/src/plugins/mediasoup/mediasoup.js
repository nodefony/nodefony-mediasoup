import nodefony from 'nodefony';

import * as mediasoupClient from 'mediasoup-client';

import Room from './room.js';
import Peer from './peer.js';
import deviceInfo from './deviceInfo.js';

class Mediasoup extends nodefony.Service {

  constructor(settings) {
    super('Mediasoup', null, null, settings);
    this.version = mediasoupClient.version;
    this.room = null;
    this.peer = null;
    this.sock = null;
    this.domain = "localhost";
    this.deviceInfo = deviceInfo();
    this.domain = this.options.VUE_APP_DOMAIN;
    this.portHttp = this.options.VUE_APP_HTTP_PORT;
    this.portHttps = this.options.VUE_APP_HTTPS_PORT;
  }

  async getWssServer() {
    let result = await this.store.dispatch('API_REQUEST', "/mediasoup/api/servers");
    /*if ( result.result.domain.proxy){

    }*/
    return result.result.domain.name ;
    //return result.result.config.webRtcTransportOptions.listenIps[0].ip;
  }

  getWssUrl(){
    return `https://${this.domain}:${this.portHttps}/mediasoup/ws` ;
  }
  getWsUrl(){
    return `http://${this.domain}:${this.portHttp}/mediasoup/ws` ;
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

  send(method, data = {}) {
    let message = JSON.stringify({
      method: method,
      roomid: this.room.id,
      peerid: this.peer.id,
      data: data
    });
    return this.sock.send(message);
  }

  connect(roomid = "test", peerid = "cci", options = {}) {
    return new Promise(async (resolve, reject) => {
      this.on("connect", (room, peer) => {
        room.init(peer);
      });
      this.domain = await this.getWssServer();
      let url = `wss://${this.domain}:5152/mediasoup/ws?roomId=${roomid}&peerId=${peerid}`;
      this.sock = new WebSocket(url);

      this.sock.onopen = (event) => {
        this.log(`Mediasoup Websocket Connect peer ${peerid} room : ${roomid}`);
        this.fire("openSock", event, this);
        this.store.commit('setConnected', true);
      };
      this.sock.onmessage = (event) => {
        let message = null;
        this.store.commit("mediasoupActivity");
        try {
          message = JSON.parse(event.data);
        } catch (e) {
          this.log(e, "ERROR");
          this.log(event.data, "ERROR");
          throw new Error(`Bad Json Message`);
        }
        let sendMessage = null;
        //this.log(message,"INFO", 'WebSocket message')
        switch (message.method) {
        case "notify":
          this.fire("notify", message, this);
          break;
        case "handshake":
          this.room = this.createRoom(message.roomid, options);
          this.peer = this.createPeer(message.peerid, options);
          //this.log(this.room, "DEBUG");
          //this.log(this.peer, "DEBUG");
          this.fire("connect", this.room, this.peer);
          sendMessage = {
            roomid: message.roomid,
            peerid: message.peerid,
            method: "getRouterRtpCapabilities"
          };
          this.sock.send(JSON.stringify(sendMessage));
          return resolve({
            room: this.room,
            peer: this.peer
          });
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
        this.sock = null ;
        return this.leaveRoom();
      };
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
      if( this.peer){
        this.peer.close();
      }
      if( this.room){
        await this.room.close();
      }
      delete this.room ;
      delete this.peer ;
      this.room = null;
      this.peer = null;
      if( this.sock){
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

export default new Mediasoup(process.env);
