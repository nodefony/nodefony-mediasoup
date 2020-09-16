import nodefony from 'nodefony';
import * as mediasoupClient from 'mediasoup-client';

const defaultOptions = {
  produce: true,
  consume: true,
  useDataChannel: true,
  forceTcp: false,
  forceH264: false,
  forceVP9: false,
  useSimulcast: false,
  externalVideo: false
};
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
    this.displayName = this.options.displayName || id;
    this.consumers = null;
    this.dataConsumers = null;
    this.webcams = null;
    this.externalVideo = this.options.externalVideo;
    this.useDataChannel = this.options.useDataChannel;
    this.forceTcp = this.options.forceTcp;
    this.useSimulcast = this.options.useSimulcast;
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
    this.peer = peer || null ;
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
    this.webcams = new Map();

    this.micProducer = null;
    this.webcamProducer = null;
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
          this.procudeTransportReady = true;
      }
      if (message.data.type === "consuming") {
        this.recvTransport = await this.consume(message.data)
        .catch((error) => {
          this.log(error, "ERROR");
        });
        this.consumeTransportReady = true;
      }
      if( this.options.produce  && this.options.consume){
        if(this.consumeTransportReady && this.procudeTransportReady){
          this.ready = true;
          this.fire("ready", this);
        }
      }else{
          this.ready = true;
          this.fire("ready", this);
      }
    });
    this.mediasoup.on("join", async (message) => {
      this.log(`Event : join `, "DEBUG");
      this.connected = true;
      const {
        peers
      } = message.data;
      for (const peer of peers) {
        let newPeer = this.mediasoup.createPeer(peer.id, { ...peer,
          consumers: [],
          dataConsumers: []
        });
        this.peers.set(peer.id, newPeer);
        this.fire("newPeer", newPeer);
      }
      // Enable mic/webcam.
      if (this.options.produce) {
        // Set our media capabilities.
        this.log(`canSendMic : ${this.mediasoupDevice.canProduce('audio')}`, "DEBUG");
        this.log(`canSendWebcam : ${this.mediasoupDevice.canProduce('video')}`, "DEBUG");
        try {
          await this.enableMic();
          //const devicesCookie = cookiesManager.getDevices();
          /*if (!devicesCookie || devicesCookie.webcamEnabled || this._externalVideo){
          }*/
          await this.enableWebcam();

        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }
        this.sendTransport.on('connectionstatechange', (connectionState) => {
          if (connectionState === 'connected') {
            //this.enableChatDataProducer();
            //this.enableBotDataProducer();
          }
        });
      }
      this.fire("joined", this);
    });
    this.mediasoup.on("connectWebRtcTransport", async (message) => {
      return this.fire("connectWebRtcTransport", message.data.id, message, this);
    });
    this.mediasoup.on("produce", async (message) => {
      return this.fire("produce", message.data.id, message, this);
    });
    this.mediasoup.on("producedata", async (message) => {
      return this.fire("producedata", message.data.id, message, this);
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
            let newPeer = this.mediasoup.createPeer(peer.id, { ...peer,
              consumers: [],
              dataConsumers: []
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
            this.fire("consumerClosed", consumerId, peerId);
            break;
          }
        case 'consumerPaused':
          {
            const {
              consumerId
            } = message.data.data;
            const consumer = this.consumers.get(consumerId);
            if (!consumer) {
              break;
            }
            consumer.pause();
            this.fire("consumerClosed", consumerId, "remote");
            break;
          }
        case 'consumerResumed':
          {
            const {
              consumerId
            } = message.data.data;
            const consumer = this.consumers.get(consumerId);
            if (!consumer) {
              break;
            }
            consumer.resume();
            this.fire("consumerResumed", consumerId, "remote");
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
              peerId
            } = message.data.data;
            this.fire("activeSpeaker", peerId);
            break;
          }
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
      if(!  this.options.produce && ! this.options.consume){
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
          this.on("produce", (id, message) => {
            if (message.error) {
              this.log(message.error, "DEBUG");
              return errback(message.error);
            }
            this.log(`Produce ${kind}  id : ${id} `, "DEBUG", "EVENT produce");
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
          this.on("producedata", (id, message) => {
            if (message.error) {
              this.log(message.error, "DEBUG");
              return errback(message.error);
            }
            this.log(`Produce Data Webrtc Transport : ${transport.id} id : ${id}`, "DEBUG", "EVENT producedata");
            return callback(id);
          });
          this.log(`Try "producedata" event: [sctpStreamParameters:${sctpStreamParameters}, appData:${appData}]`, "DEBUG");
          return this.mediasoup.send('producedata', {
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
      type,
      appData,
      producerPaused
    } = data;
    //console.log(peerId, producerId);
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
      //consumer.pause();
      //store.dispatch(
      //	stateActions.setConsumerPaused(consumer.id, 'local'));
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
      //consumer.resume();
      //store.dispatch(
      //	stateActions.setConsumerResumed(consumer.id, 'local'));
    } catch (error) {
      this.log('resumeConsumer() | failed', "ERROR");
      this.log(error, "ERROR");
    }
  }

  newDataConsumer() {

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
  async hackAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = false;
    setTimeout(() => audioTrack.stop(), 120000);
    return stream;
  }

  async enableMic() {
    this.log('enableMic()', "DEBUG");
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
        this.log(`enableMic() | calling getUserMedia())`, "DEBUG");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        track = stream.getAudioTracks()[0];
      } else {
        const stream = await this.getExternalVideoStream();
        track = stream.getAudioTracks()[0].clone();
      }
      //track = this.mediaStream.getAudioTracks()[0];
      this.micProducer = await this.sendTransport.produce({
        track,
        codecOptions: {
          opusStereo: 1,
          opusDtx: 1
        }
        // NOTE: for testing codec selection.
        // codec : this._mediasoupDevice.rtpCapabilities.codecs
        // 	.find((codec) => codec.mimeType.toLowerCase() === 'audio/pcma')
      });
      this.micProducer.on('transportclose', () => {
        this.micProducer = null;
      });
      this.micProducer.on('trackended', () => {
        this.disableMic()
          .catch(() => {});
      });
      this.fire("addProducer", {
        id: this.micProducer.id,
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
        producerId: this.micProducer.id
      });
      this.micProducer = null;
      return this.micProducer;
    } catch (e) {
      this.micProducer = null;
      this.log(e, "ERROR");
      throw e;
    }
  }
  async muteMic() {
    this.log('muteMic()', "DEBUG");
    try{
        this.micProducer.pause();
        this.mediasoup.send('pauseProducer', {
          producerId: this.micProducer.id
        });
		}
		catch (error){
      this.log(error, "ERROR");
			throw error;
		}
  }
  async unmuteMic() {
    this.log('unmuteMic()', "DEBUG");
  }
  async enableAudioOnly() {}
  async disableAudioOnly() {}
  async muteAudio() {}
  async unmuteAudio() {}

  // webcam
  async enableWebcam() {
    this.log('enableWebcam()', "DEBUG");
    if (this.webcamProducer) {
      return this.webcamProducer;
    } else if (this.shareProducer) {
      await this.disableShare();
    }
    if (!this.mediasoupDevice.canProduce('video')) {
      this.log('enableWebcam() | cannot produce video', "ERROR");
      return;
    }
    let track;
    let device;
    try {
      if (!this.externalVideo) {
        await this.updateWebcams();
        device = this.webcam.device;
        const {
          resolution
        } = this.webcam;
        if (!device) {
          throw new Error('no webcam devices');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: {
              ideal: device.deviceId
            },
            ...VIDEO_CONSTRAINS[resolution]
          }
        });
        track = stream.getVideoTracks()[0];
      } else {
        device = {
          label: 'external video'
        };
        const stream = await this.getExternalVideoStream();
        track = stream.getVideoTracks()[0].clone();
      }
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
        codec
      });
      this.webcamProducer.on('transportclose', () => {
        this.webcamProducer = null;
      });

      this.webcamProducer.on('trackended', () => {
        this.disableWebcam()
          .catch(() => {});
      });
      this.fire("addProducer", {
        id: this.webcamProducer.id,
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
    try{
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
    }catch(e){
      console.error(e)
      this.log(e, "ERROR");
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
      this.webcamProducer.close();
      this.mediasoup.send('closeProducer', {
        producerId: this.webcamProducer.id
      });
      this.webcamProducer = null;
      return this.webcamProducer;
    } catch (e) {
      this.webcamProducer = null;
      this.log(e, "ERROR");
      throw e;
    }
  }
  async changeWebcam() {}
  async changeWebcamResolution() {}

  // screen
  async enableShare() {}
  async disableShare() {}


  async restartIce() {}
  async setMaxSendingSpatialLayer() {}
  async setConsumerPreferredLayers() {}

  async setConsumerPriority() {}
  async requestConsumerKeyFrame() {}

  async enableChatDataProducer() {}
  async enableBotDataProducer() {}

  async sendChatMessage(text) {}
  async sendBotMessage(text) {}

  async changeDisplayName(displayName) {}

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
