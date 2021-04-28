import nodefony from 'nodefony-client';
import * as mediasoupClient from 'mediasoup-client';

const defaultOptions = {
  produce: true,
  consume: true,
  useDataChannel: true,
  forceTcp: false,
  forceH264: false,
  forceVP9: false,
  useSimulcast: true,
  useSharingSimulcast: true,
  externalVideo: false
};

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{
    googDscp: true
  }]
};
// Used for simulcast webcam video.
const WEBCAM_SIMULCAST_ENCODINGS = [{
    scaleResolutionDownBy: 4,
    maxBitrate: 500000
  },
  {
    scaleResolutionDownBy: 2,
    maxBitrate: 1000000
  },
  {
    scaleResolutionDownBy: 1,
    maxBitrate: 5000000
  }
];
// Used for VP9 webcam video.
const WEBCAM_KSVC_ENCODINGS = [{
  scalabilityMode: 'S3T3_KEY'
}];
// Used for simulcast screen sharing.
const SCREEN_SHARING_SIMULCAST_ENCODINGS = [{
    dtx: true,
    maxBitrate: 1500000
  },
  {
    dtx: true,
    maxBitrate: 6000000
  }
];
// Used for VP9 screen sharing.
const SCREEN_SHARING_SVC_ENCODINGS = [{
  scalabilityMode: 'S3T3',
  dtx: true
}];

class Room extends nodefony.Service {
  constructor(id, options, mediasoup) {
    let defaultOpt = nodefony.extend({}, defaultOptions);
    super("Room", mediasoup.container, null, nodefony.extend({}, defaultOpt, options));
    this.store = this.get("store");
    this.id = id;
    this.mediasoup = mediasoup;
    this.handlerName = mediasoupClient.detectDevice();
    this.displayName = this.options.displayName || "";
    this.consumers = null;
    this.dataConsumers = null;
    this.webcams = null;
    this.externalVideo = this.options.externalVideo;
    this.useDataChannel = this.options.useDataChannel;
    this.forceTcp = this.options.forceTcp;
    this.useSimulcast = this.options.useSimulcast;
    this.useSharingSimulcast = this.options.useSharingSimulcast;
    this.forceH264 = this.options.forceH264;
    this.forceVP9 = this.options.forceVP9;
    // Set custom SVC scalability mode.
    if (this.options.svc) {
      WEBCAM_KSVC_ENCODINGS[0].scalabilityMode = `${this.options.svc}_KEY`;
      SCREEN_SHARING_SVC_ENCODINGS[0].scalabilityMode = this.options.svc;
    }
    this.listenMediaSoupEvents();
  }

  init(peer) {
    this.log(`Initialize room ${this.id}`, "DEBUG");
    this.peer = peer || null;
    //this.mediaStream = new nodefony.medias.MediaStream(null, {}, this.container);
    //peer.mediaStream = this.mediaStream;
    this.connected = false;
    this.closed = false;
    this.ready = false;
    this.peers = new Map();
    this.webcam = {
      device: null,
      resolution: 'hd'
    };
    this.routerRtpCapabilities = null;
    this.mediasoupDevice = null;
    this.produceTransportInfo = null;
    this.consumeTransportInfo = null;
    this.sendTransport = null;
    this.recvTransport = null;
    this.consumers = new Map();
    this.dataConsumers = new Map();
    this.chatDataProducer = null;
    this.botDataProducer = null;
    this.webcams = new Map();

    this.micProducer = null;
    this.webcamProducer = null;

    this.shareProducer = null;
    this.hasShareConsumer = false;

    if (this.externalVideo) {
      this.externalVideo = document.createElement('video');
      this.externalVideo.controls = true;
      this.externalVideo.muted = true;
      this.externalVideo.loop = true;
      this.externalVideo.setAttribute('playsinline', '');
      //this.externalVideo.src = EXTERNAL_VIDEO_SRC;
      this.externalVideo.play()
        .catch((error) => {
          this.log('externalVideo.play() failed');
          this.log(error, "ERROR");
        });
    }
    this.externalVideoStream = null;
  }

  listenMediaSoupEvents() {
    this.mediasoup.on("closeSock", () => {
      this.connected = false;
      this.closed = true;
      return this.fire("closeRoom", this);
    });
    this.mediasoup.on("routerRtpCapabilities", async (message) => {
      this.log(`Event : routerRtpCapabilities `, "DEBUG");
      this.setRouterRtpCapabilities(message);
      await this.initTransport();
    });
    this.mediasoup.on("createWebRtcTransport", async (message) => {
      this.log(`Event : createWebRtcTransport `, "DEBUG");
      if (message.data.type === "producing") {
        this.sendTransport = await this.produce(message.data)
          .catch((error) => {
            this.log(error, "ERROR");
          });
        this.sendTransport.on('connectionstatechange', (connectionState) => {
          this.log(connectionState, "DEBUG", "connectionstatechange");
          if (connectionState === 'connected') {
            this.enableChatDataProducer();
            //this.enableBotDataProducer();
          }
        });
        this.procudeTransportReady = true;
      }
      if (message.data.type === "consuming") {
        this.recvTransport = await this.consume(message.data)
          .catch((error) => {
            this.log(error, "ERROR");
          });
        this.consumeTransportReady = true;
      }
      if (this.options.produce && this.options.consume) {
        if (this.consumeTransportReady && this.procudeTransportReady) {
          this.ready = true;
          this.fire("ready", this);
        }
      } else {
        this.ready = true;
        this.fire("ready", this);
      }
    });
    this.mediasoup.on("join", async (message) => {
      this.log(`Event : join `, "DEBUG");
      this.connected = true;
      const {
        peers,
        user
      } = message.data;
      // hydrate mdpeer with user back
      if (user) {
        this.peer.user = user;
      }
      for (const peer of peers) {
        let newPeer = this.mediasoup.createPeer(peer.id, { ...peer
        });
        this.peers.set(peer.id, newPeer);
        this.fire("newPeer", newPeer);
      }
      // Enable mic/webcam.
      let canSendMic = false;
      let canSendWebcam = false;
      if (this.options.produce) {
        // Set our media capabilities.
        canSendMic = this.mediasoupDevice.canProduce('audio');
        canSendWebcam = this.mediasoupDevice.canProduce('video');
        this.log(`canSendMic : ${canSendMic}`, "DEBUG");
        this.log(`canSendWebcam : ${canSendWebcam}`, "DEBUG");
        /*try {
          await this.enableMic();
          //const devicesCookie = cookiesManager.getDevices();
          //if (!devicesCookie || devicesCookie.webcamEnabled || this._externalVideo){
          //}
          await this.enableWebcam();

        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }*/
      }
      this.fire("joined", {
        canProduceAudio: canSendMic,
        canProduceVideo: canSendWebcam
      }, this);
    });
    this.mediasoup.on("connectWebRtcTransport", async (message) => {
      return this.fire("connectWebRtcTransport", message.data.id, message, this);
    });
    this.mediasoup.on("produce", async (message) => {
      return this.fire("produce", message.data.id, message, this);
    });
    this.mediasoup.on("produceData", async (message) => {
      return this.fire("produceData", message.data.id, message, this);
    });
    this.mediasoup.on("pauseProducer", async (message) => {
      return this.fire("pauseProducer", message.peerid, message, this);
    });
    this.mediasoup.on("resumeProducer", async (message) => {
      return this.fire("resumeProducer", message.peerid, message, this);
    });
    this.mediasoup.on("newConsumer", async (message) => {
      await this.newConsumer(message.data);
      return this.fire("newConsumer", message.data, message, this);
    });
    this.mediasoup.on("newDataConsumer", async (message) => {
      await this.newDataConsumer(message.data);
      return this.fire("newDataConsumer", message.data, message, this);
    });
    this.mediasoup.on("notify", async (message) => {
      switch (message.data.event) {
      case 'producerScore':
        {
          const {
            producerId,
            score
          } = message.data.data;
          this.fire("producerScore", producerId, score);
          break;
        }
      case "newPeer":
        {
          const peer = message.data.data;
          let newPeer = this.mediasoup.createPeer(peer.id, { ...peer
          });
          this.peers.set(peer.id, newPeer);
          this.fire("newPeer", newPeer);
          break;
        }
      case 'peerClosed':
        {
          const {
            peerId
          } = message.data.data;

          this.fire("peerClosed", peerId);
          this.peers.delete(peerId);
          break;
        }
      case 'peerDisplayNameChanged':
        {
          const {
            peerId,
            displayName,
            oldDisplayName
          } = message.data.data;
          this.fire("peerDisplayNameChanged", peerId, displayName, oldDisplayName);
          break;
        }
      case 'downlinkBwe':
        {
          this.fire("downlinkBwe", message.data.data);
          break;
        }
      case 'consumerClosed':
        {
          const {
            consumerId
          } = message.data.data;
          const consumer = this.consumers.get(consumerId);
          if (!consumer) {
            break;
          }
          this.consumers.delete(consumerId);
          const {
            peerId
          } = consumer.appData;
          this.fire("consumerClosed", consumerId, peerId, consumer.appData);
          let peer = this.peers.get(peerId);
          if (peer) {
            peer.deleteConsumer(consumerId);
          }
          break;
        }
      case 'consumerPaused':
        {
          const {
            consumerId,
            peerId
          } = message.data.data;
          const consumer = this.consumers.get(consumerId);
          if (!consumer) {
            break;
          }
          consumer.pause();
          let peer = this.peers.get(peerId);
          if (peer) {
            if (consumer.kind === "audio") {
              peer.audioPaused = consumer.paused;
            }
            if (consumer.kind === "video") {
              peer.videoPaused = consumer.paused;
            }
          }
          this.fire("consumerPaused", consumerId, peer);
          break;
        }
      case 'consumerResumed':
        {
          const {
            consumerId,
            peerId
          } = message.data.data;
          const consumer = this.consumers.get(consumerId);
          if (!consumer) {
            break;
          }
          consumer.resume();
          let peer = this.peers.get(peerId);
          if (peer) {
            if (consumer.kind === "audio") {
              peer.audioPaused = consumer.paused;
            }
            if (consumer.kind === "video") {
              peer.videoPaused = consumer.paused;
            }
          }
          this.fire("consumerResumed", consumerId, peer);
          break;
        }
      case 'consumerLayersChanged':
        {
          const {
            consumerId,
            spatialLayer,
            temporalLayer
          } = message.data.data;
          const consumer = this.consumers.get(consumerId);
          if (!consumer) {
            break;
          }
          this.fire("consumerLayersChanged", consumerId, spatialLayer, temporalLayer);
          break;
        }
      case 'consumerScore':
        {
          const {
            consumerId,
            score
          } = message.data.data;
          this.fire("consumerScore", consumerId, score);
          break;
        }
      case 'dataConsumerClosed':
        {
          const {
            dataConsumerId
          } = message.data.data;
          const dataConsumer = this.dataConsumers.get(dataConsumerId);
          if (!dataConsumer) {
            break;
          }
          dataConsumer.close();
          this.dataConsumers.delete(dataConsumerId);
          const {
            peerId
          } = dataConsumer.appData;
          this.fire("dataConsumerClosed", dataConsumerId, peerId);
          break;
        }
      case 'activeSpeaker':
        {
          const {
            peerId,
            volume
          } = message.data.data;
          this.fire("activeSpeaker", peerId, volume);
          break;
        }
      case "producerresume":
        this.fire("resumeMyProducer", message.data.data, this);
        //this.fire("resumeProducer", message, this);
        break;
      case "producerpause":
        this.fire("pauseMyProducer", message.data.data, this);
        break;
      case "openMedia":
        this.fire("openMedia", message.data.data, this);
        break;
      default:
        this.log(message.data.event, "NOTICE");
        this.log(message.data.data, "DEBUG");
        this.fire("notify", message.data.event, message.data.data);
      }
    });
  }

  join() {
    // Join now into the room.
    // NOTE: Don't send our RTP capabilities if we don't want to consume.
    this.mediasoup.send('join', {
      displayName: this.displayName,
      device: this.mediasoup.deviceInfo,
      rtpCapabilities: this.consume ?
        this.mediasoupDevice.rtpCapabilities : undefined,
      sctpCapabilities: this.useDataChannel && this.consume ?
        this.mediasoupDevice.sctpCapabilities : undefined
    });
    return this;
  }

  async close() {
    this.removeAllListeners();
    this.log(`Closing room`);
    // Close mediasoup Transports.
    if (this.sendTransport) {
      await this.sendTransport.close();
    }
    if (this.recvTransport) {
      await this.recvTransport.close();
    }
    this.closed = true;
    //this.init();
    return this;
  }

  // DEVICE
  async createDevice() {
    const device = new mediasoupClient.Device({
      handlerName: this.handlerName
    });
    await device.load({
      routerRtpCapabilities: this.routerRtpCapabilities
    });
    return device;
  }

  // TRANSPORT
  async initTransport() {
    try {
      this.mediasoupDevice = await this.createDevice();
      this.log(`Device endpoint load routerRtpCapabilities `, "DEBUG");
      // Create mediasoup Transport for sending (to produce)
      if (this.options.produce) {
        this.createWebRtcTransport(true, false);
      }
      // Create mediasoup Transport for sending (to consume).
      if (this.options.consume) {
        this.createWebRtcTransport(false, true);
      }
      if (!this.options.produce && !this.options.consume) {
        this.ready = true;
        this.fire("ready", this);
      }
      return this.mediasoupDevice;
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        this.log('browser not supported', "ERROR");
        throw error;
      }
      this.log(error, "ERROR");
      throw error;
    }
  }

  createWebRtcTransport(produce, consume) {
    let sctpCapabilities = null;
    if (this.useDataChannel) {
      sctpCapabilities = this.mediasoupDevice.sctpCapabilities;
    }
    let data = {
      forceTcp: this.forceTcp,
      producing: produce,
      consuming: consume,
      sctpCapabilities: sctpCapabilities
    };
    return this.mediasoup.send('createWebRtcTransport', data);
  }

  // PRODUCER
  produce(transportInfo) {
    return new Promise((resolve, reject) => {
      try {
        this.log(`Create Transport Webrtc Producer `, "DEBUG");
        // createWebRtcTransport
        if (!transportInfo) {
          throw new Error(`Bad transportInfo `);
        }
        delete transportInfo.type;
        this.produceTransportInfo = transportInfo;
        this.produceTransportInfo.iceServers = [];
        this.produceTransportInfo.proprietaryConstraints = PC_PROPRIETARY_CONSTRAINTS;
        const transport = this.mediasoupDevice.createSendTransport(transportInfo);
        transport.on('connect', ({
          dtlsParameters
        }, callback, errback) => {
          this.on("connectWebRtcTransport", (id, message) => {
            if (id === transport.id) {
              if (message.error) {
                this.log(message.error, "DEBUG");
                return errback(message.error);
              }
              this.log(`Connect Transport : ${transport.id} `, "DEBUG", "EVENT connectWebRtcTransport");
              return callback(message.data);
            }
          });
          this.log(`Try Connect Produce Webrtc Transport ${transport.id} `, "DEBUG");
          return this.mediasoup.send('connectWebRtcTransport', {
            type: "producing",
            transportId: transport.id,
            dtlsParameters
          });
        });

        transport.on('produce', ({
          kind,
          rtpParameters,
          appData
        }, callback, errback) => {
          this.once("produce", (id, message) => {
            if (message.error) {
              this.log(message.error, "DEBUG");
              return errback(message.error);
            }
            this.log(`Produce ${kind}  id : ${id} `, "INFO", "EVENT produce");
            if (message.data.appData.audio) {
              this.micProducerId = id;
            }
            if (message.data.appData.video) {
              this.videoProducerId = id;
            }
            if (message.data.appData.share) {
              this.shareProducerId = id;
            }
            /*this.log(` rtpParameters :
                ${JSON.stringify(rtpParameters, null, " ")}`, "DEBUG");
            this.log(` appData :
                ${JSON.stringify(appData, null, " ")}`, "DEBUG");*/
            return callback(id);
          });
          this.log(`Try Produce Webrtc ${kind}  Transport ${transport.id} : Event produce `, "DEBUG");
          return this.mediasoup.send('produce', {
            transportId: transport.id,
            kind,
            rtpParameters,
            appData
          });
        });

        transport.on('producedata', ({
          sctpStreamParameters,
          label,
          protocol,
          appData
        }, callback, errback) => {
          // eslint-disable-next-line no-shadow
          this.on("produceData", (id, message) => {
            if (message.error) {
              this.log(message.error, "DEBUG");
              return errback(message.error);
            }
            this.log(`Produce Data Webrtc Transport : ${transport.id} id : ${id}`, "DEBUG", "EVENT producedata");
            return callback(id);
          });
          this.log(`Try "producedata" event: [sctpStreamParameters:${sctpStreamParameters}, appData:${appData}]`, "DEBUG");
          return this.mediasoup.send('produceData', {
            transportId: transport.id,
            sctpStreamParameters,
            label,
            protocol,
            appData
          });
        });
        return resolve(transport);
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  // CONSUMER
  async consume(transportInfo) {
    this.log(`Create Transport Webrtc Consumer `, "DEBUG");
    // createWebRtcTransport
    if (!transportInfo) {
      throw new Error(`Bad transportInfo `);
    }
    delete transportInfo.type;
    this.consumeTransportInfo = transportInfo;
    const transport = this.mediasoupDevice.createRecvTransport(transportInfo);
    // eslint-disable-line no-shadow
    transport.on('connect', ({
      dtlsParameters
    }, callback, errback) => {
      this.log(`Consume Webrtc Transport ${transport.id} : connect`, "DEBUG");
      this.on("connectWebRtcTransport", (id, message) => {
        if (id === transport.id) {
          if (message.error) {
            this.log(message.error, "DEBUG");
            return errback(message.error);
          }
          this.log(`Consume Connect Transport : ${transport.id} `, "DEBUG", "EVENT connectWebRtcTransport");
          return callback();
        }
      });
      return this.mediasoup.send('connectWebRtcTransport', {
        type: "consoming",
        transportId: transport.id,
        dtlsParameters
      });
    });
    return transport;
  }

  async newConsumer(data) {
    if (!this.consume) {
      const error = new Error(`I do not want to consume`);
      this.mediasoup.send('newConsumer', {
        code: 403,
        error: 'I do not want to consume'
      });
      throw error;
    }
    const {
      peerId,
      producerId,
      id,
      kind,
      rtpParameters,
      //type,
      appData,
      producerPaused
    } = data;
    this.log(`peerId (consumer)  producer status paused : ${producerPaused} `, "DEBUG");
    if (appData.share) {
      if (this.shareProducer) {
        await this.disableShare(this.shareProducer.id);
      }
    }
    try {
      const consumer = await this.recvTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
        appData: { ...appData,
          peerId
        } // Trick.
      });
      // Store in the map.
      this.consumers.set(consumer.id, consumer);
      consumer.on('transportclose', () => {
        this.consumers.delete(consumer.id);
      });

      const {
        spatialLayers,
        temporalLayers
      } =
      mediasoupClient.parseScalabilityMode(
        consumer.rtpParameters.encodings[0].scalabilityMode);

      // If audio-only mode is enabled, pause it.
      if (consumer.kind === 'video' /*&& store.getState().me.audioOnly*/ ) {
        //this.pauseConsumer(consumer);
      }
      let peer = this.peers.get(consumer._appData.peerId);
      peer.addConsumer(consumer);
      if (consumer.kind === "audio" && !appData.share) {
        peer.audioPaused = consumer.paused;
      }
      if (consumer.kind === "video" && !appData.share) {
        peer.videoPaused = consumer.paused;
      }
      this.fire("consume", consumer, peer, spatialLayers, temporalLayers);
      return consumer;
    } catch (error) {
      this.log(`New consumer : `, "ERROR");
      this.log(error, "ERROR");
      throw error;
    }
  }

  async pauseConsumer(consumer) {
    if (consumer.paused) {
      return;
    }
    try {
      return this.mediasoup.send('pauseConsumer', {
        consumerId: consumer.id
      });
    } catch (error) {
      this.log('_pauseConsumer() | failed', "ERROR");
      this.log(error, "ERROR");
    }
  }

  async resumeConsumer(consumer) {
    if (!consumer.paused) {
      return;
    }
    try {
      return this.mediasoup.send('resumeConsumer', {
        consumerId: consumer.id
      });
    } catch (error) {
      this.log('resumeConsumer() | failed', "ERROR");
      this.log(error, "ERROR");
    }
  }

  async newDataConsumer(data) {
    try {
      if (!this.options.consume) {
        throw new Error('I do not want to data consume');
      }
      if (!this.useDataChannel) {
        throw new Error('I do not want DataChannels');
      }
      const {
        peerId, // NOTE: Null if bot.
        dataProducerId,
        id,
        sctpStreamParameters,
        label,
        protocol,
        appData
      } = data;
      const dataConsumer = await this.recvTransport.consumeData({
        id,
        dataProducerId,
        sctpStreamParameters,
        label,
        protocol,
        appData: { ...appData,
          peerId
        } // Trick.
      });
      let peer = this.peers.get(peerId);
      let dataConsumers = null;
      if (peer) {
        dataConsumers = peer.dataConsumers;
      } else {
        dataConsumers = this.peer.dataConsumers;
      }
      // Store in the map.
      dataConsumers.set(dataConsumer.id, dataConsumer);
      dataConsumer.on('transportclose', () => {
        dataConsumers.delete(dataConsumer.id);
      });
      dataConsumer.on('open', () => {
        this.log('DataConsumer "open" event', "DEBUG");
      });
      dataConsumer.on('close', () => {
        this.log('DataConsumer "close" event', "WARNING");
        dataConsumers.delete(dataConsumer.id);
        this.fire('onDataConsumerClose', {
          id: dataConsumer.id
        })
      });
      dataConsumer.on('error', (error) => {
        this.log(error, "ERROR");
        this.fire("onDataConsumerError", error);
      });
      dataConsumer.on('message', (message) => {
        this.log(`DataConsumer "message" event [streamId:${dataConsumer.sctpStreamParameters.streamId}]`, "DEBUG");
        if (message instanceof ArrayBuffer) {
          const view = new DataView(message);
          const number = view.getUint32();
          this.log(number, "INFO", "DataConsumer ArrayBuffer");
        } else if (typeof message !== 'string') {
          this.log('ignoring DataConsumer "message" (not a string)', "DEBUG");
          return;
        }
        switch (dataConsumer.label) {
        case 'chat':
          {
            let from = null;
            this.peers.forEach((peer) => {
              let res = peer.dataConsumers.has(dataConsumer.id);
              if (res) {
                from = peer;
              }
            });
            if (!from) {
              let res = this.peer.dataConsumers.has(dataConsumer.id);
              if (res) {
                from = this.peer;
              } else {
                this.log('DataConsumer "message" from unknown peer', "DEBUG");
                break;
              }
            }
            this.fire("onDataConsumerMessage", {
              from,
              message
            });
            break;
          }
        case 'bot':
          {
            this.fire("onDataConsumerMessage", {
              from: 'bot',
              message
            });
            break;
          }
        }
      });
      this.fire("addDataConsumer", {
        id: dataConsumer.id,
        sctpStreamParameters: dataConsumer.sctpStreamParameters,
        label: dataConsumer.label,
        protocol: dataConsumer.protocol
      }, peerId);

    } catch (error) {
      this.fire("onDataConsumerError", error);
    }
  }

  setRouterRtpCapabilities(message) {
    this.log("setRouterRtpCapabilities", "DEBUG");
    this.routerRtpCapabilities = message.router.rtpCapabilities;
  }

  // audio
  // NOTE: Stuff to play remote audios due to browsers' new autoplay policy.
  //
  // Just get access to the mic and DO NOT close the mic track for a while.
  // Super hack!
  /*async hackAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = false;
    setTimeout(() => audioTrack.stop(), 120000);
    return stream;
  }*/

  async enableMic(stream, microphone, mute) {
    if (this.micProducer) {
      return this.micProducer;
    }
    if (!this.mediasoupDevice.canProduce('audio')) {
      this.log('enableMic() | cannot produce audio', "ERROR");
      return;
    }
    let track;
    try {
      if (!this.externalVideo) {
        this.log(`enableMic() mute : ${mute}`, "DEBUG");
        this.microphone = microphone;
        if (!stream || !stream.stream) {
          let options = null;
          if (!this.microphone) {
            options = true;
          } else {
            if (this.microphone.device) {
              options = {
                deviceId: {
                  ideal: this.microphone.device.deviceId
                }
              }
            } else {
              options = true;
            }
          }
          this.log(`enableMic() => calling getUserMedia())`, "DEBUG");
          this.log(options, "DEBUG")
          stream = await navigator.mediaDevices.getUserMedia({
            audio: options
          }).catch(e => {
            this.log(e, "ERROR");
            throw e;
          });
          if (!stream) {
            this.log(`Can't create Audio Stream `, "WARNING");
            return;
          }
        }
        track = stream.getAudioTracks()[0];
      } else {
        const stream = await this.getExternalVideoStream();
        track = stream.getAudioTracks()[0].clone();
      }
      if (!track) {
        this.log(`No Audio track `, "WARNING");
        return;
      }
      //track = this.mediaStream.getAudioTracks()[0];
      this.micProducer = await this.sendTransport.produce({
        track,
        codecOptions: {
          opusStereo: 1,
          opusDtx: 1
        },
        appData: {
          audio: true
        }
        // NOTE: for testing codec selection.
        // codec : this._mediasoupDevice.rtpCapabilities.codecs
        // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
      });
      if (mute) {
        this.muteMic();
      }
      this.micProducer.on('transportclose', () => {
        this.micProducer = null;
      });
      this.micProducer.on('trackended', () => {
        this.disableMic()
          .catch(() => {});
      });
      this.fire("addProducer", {
        id: this.micProducerId,
        paused: this.micProducer.paused,
        track: this.micProducer.track,
        rtpParameters: this.micProducer.rtpParameters,
        codec: this.micProducer.rtpParameters.codecs[0].mimeType.split('/')[1]
      });
      return this.micProducer;
    } catch (e) {
      this.log(e, "ERROR");
      if (track) {
        track.stop();
      }
      throw e;
    }
  }

  async disableMic() {
    this.log('disableMic()', "DEBUG");
    if (!this.micProducer) {
      return;
    }
    try {
      this.micProducer.close();
      this.mediasoup.send('closeProducer', {
        producerId: this.micProducerId
      });
      this.micProducer = null;
      this.micProducerId = null;
      this.fire("disableMicrophone", this.micProducerId);
      return this.micProducer;
    } catch (e) {
      this.micProducer = null;
      this.log(e, "ERROR");
      throw e;
    }
  }
  async muteMic() {
    this.log('muteMic()', "DEBUG");
    try {
      this.micProducer.pause();
      this.mediasoup.send('pauseProducer', {
        producerId: this.micProducerId
      });
    } catch (error) {
      this.log(error, "ERROR");
      throw error;
    }
  }
  async unmuteMic() {
    this.log('unmuteMic()', "DEBUG");
    try {
      this.micProducer.resume();
      this.mediasoup.send('resumeProducer', {
        producerId: this.micProducerId
      });
    } catch (error) {
      this.log(error, "ERROR");
      throw error;
    }
  }
  async enableAudioOnly() {
    this.log('enableAudioOnly()', "DEBUG");
    this.disableWebcam();
    for (const consumer of this.consumers.values()) {
      if (consumer.kind !== 'video') {
        continue;
      }
      this.pauseConsumer(consumer);
    }
  }
  async disableAudioOnly(stream) {
    this.log('disableAudioOnly()', "DEBUG");
    if (!this.webcamProducer && this.options.produce) {
      this.enableWebcam(stream);
    }
    for (const consumer of this.consumers.values()) {
      if (consumer.kind !== 'video') {
        continue;
      }
      this.resumeConsumer(consumer);
    }
  }

  // webcam
  async enableWebcam(stream, webcam) {
    if (this.webcamProducer) {
      return this.webcamProducer;
    }
    if (!this.mediasoupDevice.canProduce('video')) {
      this.log('enableWebcam() | cannot produce video', "ERROR");
      return;
    }
    let track;
    let device;
    try {
      if (!this.externalVideo) {
        if (!webcam) {
          await this.updateWebcams();
        } else {
          this.webcam = webcam
        }
        device = this.webcam.device;
        if (!device) {
          if (webcam) {
            device = await this.updateWebcams();
          } else {
            throw new Error('no webcam devices');
          }
        }
        const {
          resolution
        } = this.webcam;
        this.log('enableWebcam()', "DEBUG");
        if (!stream) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: {
                ideal: device.deviceId
              },
              ...this.mediasoup.VIDEO_CONSTRAINS[resolution]
            }
          });
        }
        track = stream.getVideoTracks()[0];
        if (track && track.readyState === "ended") {
          return this.enableWebcam(null, webcam);
        }
      } else {
        device = {
          label: 'external video'
        };
        const stream = await this.getExternalVideoStream();
        track = stream.getVideoTracks()[0].clone();
      }
      if (!track) {
        this.log(`No video track `, "WARNING");
        return;
      }

      // mediasoup options
      let encodings;
      let codec;
      const codecOptions = {
        videoGoogleStartBitrate: 1000
      };
      if (this.forceH264) {
        codec = this.mediasoupDevice.rtpCapabilities.codecs
          .find((c) => c.mimeType.toLowerCase() === 'video/h264');
        if (!codec) {
          throw new Error('desired H264 codec+configuration is not supported');
        }
      } else if (this.forceVP9) {
        codec = this.mediasoupDevice.rtpCapabilities.codecs
          .find((c) => c.mimeType.toLowerCase() === 'video/vp9');
        if (!codec) {
          throw new Error('desired VP9 codec+configuration is not supported');
        }
      }
      if (this.useSimulcast) {
        // If VP9 is the only available video codec then use SVC.
        const firstVideoCodec = this.mediasoupDevice
          .rtpCapabilities
          .codecs
          .find((c) => c.kind === 'video');
        if ((this.forceVP9 && codec) ||
          firstVideoCodec.mimeType.toLowerCase() === 'video/vp9'
        ) {
          encodings = WEBCAM_KSVC_ENCODINGS;
        } else {
          encodings = WEBCAM_SIMULCAST_ENCODINGS;
        }
      }
      this.webcamProducer = await this.sendTransport.produce({
        track,
        encodings,
        codecOptions,
        codec,
        appData: {
          video: true
        }
      });
      this.webcamProducer.on('transportclose', () => {
        this.webcamProducer = null;
      });

      this.webcamProducer.on('trackended', () => {
        return this.disableWebcam()
          .catch(() => {});
      });
      this.fire("addProducer", {
        id: this.videoProducerId,
        deviceLabel: device.label,
        type: this.getWebcamType(device),
        paused: this.webcamProducer.paused,
        track: this.webcamProducer.track,
        rtpParameters: this.webcamProducer.rtpParameters,
        codec: this.webcamProducer.rtpParameters.codecs[0].mimeType.split('/')[1]
      });
      return this.webcamProducer;
    } catch (e) {
      this.log(e, "ERROR");
      if (track) {
        track.stop();
      }
    }
  }

  getWebcamType(device) {
    if (/(back|rear)/i.test(device.label)) {
      this.log(`getWebcamType() | it seems to be a back camera`, "DEBUG");
      return 'back';
    } else {
      this.log(`getWebcamType() | it seems to be a front camera`, "DEBUG");
      return 'front';
    }
  }
  async updateWebcams() {
    try {
      this.log('updateWebcams()', "DEBUG");
      // Reset the list.
      this.webcams = new Map();
      //this.log('updateWebcams() | calling enumerateDevices()', "DEBUG");
      const devices = await navigator.mediaDevices.enumerateDevices();

      for (const device of devices) {
        if (device.kind !== 'videoinput') {
          continue;
        }
        this.webcams.set(device.deviceId, device);
      }
      const array = Array.from(this.webcams.values());
      const len = array.length;
      const currentWebcamId =
        this.webcam.device ? this.webcam.device.deviceId : null;
      //this.log('updateWebcams()', "DEBUG");
      //this.log(array, "DEBUG")
      if (len === 0) {
        this.webcam.device = null;
      } else if (!this.webcams.has(currentWebcamId)) {
        this.webcam.device = array[0];
      }
      return this.webcam;
    } catch (e) {
      this.log(`updateWebcams()`, "ERROR");
      this.log(e, "ERROR");
      throw e;
    }
  }

  async getExternalVideoStream() {
    if (this.externalVideoStream) {
      return this.externalVideoStream;
    }
    if (this.externalVideo.readyState < 3) {
      await new Promise((resolve) => (
        this.externalVideo.addEventListener('canplay', resolve)
      ));
    }
    if (this.externalVideo.captureStream) {
      this.externalVideoStream = this.externalVideo.captureStream();
    } else if (this._externalVideo.mozCaptureStream) {
      this.externalVideoStream = this.externalVideo.mozCaptureStream();
    } else {
      throw new Error('video.captureStream() not supported');
    }
    return this.externalVideoStream;
  }

  async disableWebcam() {
    this.log('disableWebcam()', "DEBUG");
    if (!this.webcamProducer) {
      return;
    }
    try {
      this.fire("disableWebcam", this.webcamProducer);
      this.peer.deleteProducer(this.webcamProducer.id);
      this.webcamProducer.close();
      this.mediasoup.send('closeProducer', {
        producerId: this.videoProducerId
      });
      this.webcamProducer = null;
      this.videoProducerId = null;
      return this.webcamProducer;
    } catch (e) {
      this.webcamProducer = null;
      this.log(e, "ERROR");
      throw e;
    }
  }
  async changeWebcam() {
    this.log('changeWebcam()', "DEBUG");
    try {
      await this.updateWebcams();
      const array = Array.from(this.webcams.keys());
      const len = array.length;
      const deviceId =
        this.webcam.device ? this.webcam.device.deviceId : undefined;
      let idx = array.indexOf(deviceId);
      if (idx < len - 1)
        idx++;
      else
        idx = 0;
      this.webcam.device = this.webcams.get(array[idx]);
      this.log(`changeWebcam() | new selected webcam device`, "DEBUG");
      this.log(this.webcam.device, "DEBUG");
      // Reset video resolution to HD.
      this.webcam.resolution = 'hd';
      if (!this.webcam.device) {
        throw new Error('no webcam devices');
      }
      // Closing the current video track before asking for a new one (mobiles do not like
      // having both front/back cameras open at the same time).
      this.webcamProducer.track.stop();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: this.webcam.device.deviceId
          },
          ...this.mediasoup.VIDEO_CONSTRAINS[this.webcam.resolution]
        }
      });
      const track = stream.getVideoTracks()[0];
      await this.webcamProducer.replaceTrack({
        track
      });
      this.fire("changeWebCam", track, this.webcam);
    } catch (error) {
      this.log('changeWebcam()', "ERROR");
      this.log(error, "ERROR");
      throw error;
    }
  }
  async changeWebcamResolution() {
    this.log('changeWebcamResolution()', "DEBUG");
    try {
      switch (this.webcam.resolution) {
      case 'qvga':
        this.webcam.resolution = 'vga';
        break;
      case 'vga':
        this.webcam.resolution = 'hd';
        break;
      case 'hd':
        this.webcam.resolution = 'qvga';
        break;
      default:
        this.webcam.resolution = 'hd';
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: {
            exact: this.webcam.device.deviceId
          },
          ...this.mediasoup.VIDEO_CONSTRAINS[this.webcam.resolution]
        }
      });
      const track = stream.getVideoTracks()[0];
      await this.webcamProducer.replaceTrack({
        track
      });
      this.fire("changeWebcamResolution", track, this.webcam);
    } catch (error) {
      this.log('changeWebcamResolution()', "ERROR");
      this.log(error, "ERROR");
      throw error;
    }
  }

  // screen
  async enableShare() {
    this.log(`Enable share screen`, "DEBUG");
    if (this.shareProducer) {
      await this.disableShare(this.shareProducer.id);
    }
    if (!this.mediasoupDevice.canProduce('video')) {
      this.log('enableShare() | cannot produce video', "ERROR");
      return;
    }
    let track;
    try {
      this.log('enableShare() | calling getDisplayMedia()');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: {
          displaySurface: 'monitor',
          logicalSurface: true,
          cursor: true,
          width: {
            max: 1920
          },
          height: {
            max: 1080
          },
          frameRate: {
            max: 30
          }
        }
      });
      // May mean cancelled (in some implementations).
      if (!stream) {
        this.log(`Share screen no stream `, "ERROR");
        return;
      }
      track = stream.getVideoTracks()[0];
      let encodings;
      let codec;
      const codecOptions = {
        videoGoogleStartBitrate: 1000
      };
      if (this.forceH264) {
        codec = this.mediasoupDevice.rtpCapabilities.codecs
          .find((c) => c.mimeType.toLowerCase() === 'video/h264');
        if (!codec) {
          throw new Error('desired H264 codec+configuration is not supported');
        }
      } else if (this.forceVP9) {
        codec = this.mediasoupDevice.rtpCapabilities.codecs
          .find((c) => c.mimeType.toLowerCase() === 'video/vp9');
        if (!codec) {
          throw new Error('desired VP9 codec+configuration is not supported');
        }
      }
      if (this.useSharingSimulcast) {
        // If VP9 is the only available video codec then use SVC.
        const firstVideoCodec = this.mediasoupDevice
          .rtpCapabilities
          .codecs
          .find((c) => c.kind === 'video');
        if (
          (this._forceVP9 && codec) ||
          firstVideoCodec.mimeType.toLowerCase() === 'video/vp9'
        ) {
          encodings = SCREEN_SHARING_SVC_ENCODINGS;
        } else {
          encodings = SCREEN_SHARING_SIMULCAST_ENCODINGS
            .map((encoding) => ({ ...encoding,
              dtx: true
            }));
        }
      }
      this.shareProducer = await this.sendTransport.produce({
        track,
        encodings,
        codecOptions,
        codec,
        appData: {
          share: true
        }
      });
      this.shareProducer.on('transportclose', () => {
        this.shareProducer = null;
      });
      this.shareProducer.on('trackended', () => {
        this.log(`Share disconnected`, "WARNING");
        //this.fire("error", new Error(`Share disconnected`))
        this.disableShare(this.shareProducer.id)
          .catch(() => {});
      });
      this.fire("addProducer", {
        id: this.shareProducerId,
        type: 'share',
        paused: this.shareProducer.paused,
        track: this.shareProducer.track,
        rtpParameters: this.shareProducer.rtpParameters,
        codec: this.shareProducer.rtpParameters.codecs[0].mimeType.split('/')[1]
      });
      return this.shareProducer;
    } catch (error) {
      this.log(error, "ERROR");
      if (error.name !== 'NotAllowedError') {
        this.fire("error", error)
      }
      if (track) {
        track.stop();
      }
    }
  }

  disableShare(id) {
    return new Promise((resolve, reject) => {
      try {
        this.log(`Disable share screen`);
        if (this.shareProducer) {
          this.shareProducer.close();
          this.mediasoup.send('closeProducer', {
            producerId: this.shareProducerId
          });
          this.fire("disableShare", id);
          this.shareProducer = null;
          this.shareProducerId = null;
          return resolve(this);
        } else {
          this.fire("disableShare", id);
          /*this.once('disableShare', () => {
            return resolve(this);
          });*/
        }
      } catch (error) {
        this.fire("error", error)
        this.log(error);
        return reject(error);
      }
    });
  }

  async restartIce() {}
  async changeDisplayName() {}
  async setMaxSendingSpatialLayer() {}
  async setConsumerPreferredLayers() {}

  async setConsumerPriority() {}
  async requestConsumerKeyFrame() {}

  // CHAT DATA
  async enableChatDataProducer() {
    this.log('enableChatDataProducer()', "DEBUG");
    if (!this.useDataChannel) {
      return;
    }
    if (this.chatDataProducer) {
      return;
    }
    try {
      // Create chat DataProducer.
      this.chatDataProducer = await this.sendTransport.produceData({
        ordered: false,
        maxRetransmits: 1,
        //maxPacketLifeTime : 2000,
        label: 'chat',
        priority: 'medium',
        appData: {
          info: 'my-chat-DataProducer',
          peer:this.peer.id
        }
      });
      //this.chatDataProducer.bufferedAmountLowThreshold = 100;
      this.fire("onDataProducer", {
        id: this.chatDataProducer.id,
        sctpStreamParameters: this.chatDataProducer.sctpStreamParameters,
        label: this.chatDataProducer.label,
        protocol: this.chatDataProducer.protocol
      });
      this.chatDataProducer.on('transportclose', () => {
        this.chatDataProducer = null;
      });
      this.chatDataProducer.on('open', () => {
        this.log('chat DataProducer "open" event');
      });
      this.chatDataProducer.on('close', () => {
        this.log('chat DataProducer "close" event', "DEBUG", "chat DataProducer Event");
        this.fire("onDataProducerClose", this.chatDataProducer);
        this.chatDataProducer = null;
      });
      this.chatDataProducer.on('error', (error) => {
        this.log(error, "ERROR", "chat DataProducer Event");
        this.fire("onChatDataProducerError", error);
      });
      this.chatDataProducer.on('bufferedamountlow', () => {
        this.log({
          bufferedAmountLowThreshold: this.chatDataProducer.bufferedAmountLowThreshold,
          bufferedAmount: this.chatDataProducer.bufferedAmount
        }, "WARNING", "chat DataProducer Event bufferedamountlow");
      });
      return this.chatDataProducer;
    } catch (error) {
      this.log(error, "ERROR", 'chat DataProducer');
      this.fire("onChatDataProducerError", error);
      throw error;
    }
  }
  async enableBotDataProducer() {
    this.log('enableBotDataProducer()', "DEBUG");
    if (!this.useDataChannel) {
      return;
    }
    if (this.botDataProducer) {
      return;
    }
    try {
      // Create Bot DataProducer.
      this.botDataProducer = await this.sendTransport.produceData({
        ordered: false,
        maxPacketLifeTime: 2000,
        label: 'bot',
        priority: 'medium',
        appData: {
          info: 'my-bot-DataProducer'
        }
      });
      this.fire("onDataProducer", {
        id: this.botDataProducer.id,
        sctpStreamParameters: this.botDataProducer.sctpStreamParameters,
        label: this.botDataProducer.label,
        protocol: this.botDataProducer.protocol
      });
      this.botDataProducer.on('transportclose', () => {
        this.botDataProducer = null;
      });
      this.botDataProducer.on('open', () => {
        this.log('Bot DataProducer "open" event');
      });
      this.botDataProducer.on('close', () => {
        this.log('Bot DataProducer "close" event');
        this.fire("onBotDataProducerClose", this.chatDataProducer);
        this.chatDataProducer = null;
      });
      this.botDataProducer.on('error', (error) => {
        this.log(error, "ERROR", "chat DataProducer");
        this.fire("onBotDataProducerError", error);
      });
      this.botDataProducer.on('bufferedamountlow', () => {
        this.log("bufferedamountlow", "WARNING", "Bot DataProducer");
      });
      return this.botDataProducer;
    } catch (error) {
      this.log(error, "ERROR", 'enableBotDataProducer');
      this.fire("onBotDataProducerError", error);
      throw error;
    }
  }
  async sendChatMessage(text) {
    this.log(text, "INFO", "sendChatMessage");
    if (!this.chatDataProducer) {
      return this.fire("onDataProducerError", new Error('No chat DataProducer'));
    }
    try {
      this.chatDataProducer.send(text);
    } catch (error) {
      this.log(error, "ERROR", "DataProducer send");
      this.fire("onDataProducerError", error);
    }
  }
  async sendBotMessage(text) {
    this.log(text, "INFO", "sendBotMessage");
    if (!this.botDataProducer) {
      return this.fire("onDataProducerError", new Error('No bot DataProducer'));
    }
    try {
      this.botDataProducer.send(text);
    } catch (error) {
      this.log(error, "ERROR", "botDataProducer send");
      this.fire("onDataProducerError", error);
    }
  }

  // stats
  async getSendTransportRemoteStats() {}
  async getRecvTransportRemoteStats() {}
  async getAudioRemoteStats() {}
  async getVideoRemoteStats() {}
  async getConsumerRemoteStats(consumerId) {}
  async getChatDataProducerRemoteStats() {}
  async getBotDataProducerRemoteStats() {}
  async getDataConsumerRemoteStats(dataConsumerId) {}
  async getSendTransportLocalStats() {}
  async getRecvTransportLocalStats() {}
  async getAudioLocalStats() {}
  async getVideoLocalStats() {}
  async getConsumerLocalStats(consumerId) {}

  async applyNetworkThrottle({
    uplink,
    downlink,
    rtt,
    secret
  }) {}
  async resetNetworkThrottle({
    silent = false,
    secret
  }) {}
}

export default Room;
