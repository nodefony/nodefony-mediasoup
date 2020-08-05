import nodefony from 'nodefony';
import * as mediasoupClient from 'mediasoup-client';

const defaultOptions = {
  produce: true,
  consume: true,
  useDataChannel: true,
  forceTcp: false,
  forceH264: false,
  forceVP9: false,
  useSimulcast: false
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
const WEBCAM_SIMULCAST_ENCODINGS = [
  {
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
const WEBCAM_KSVC_ENCODINGS = [
  {
    scalabilityMode: 'S3T3_KEY'
  }
];
// Used for simulcast screen sharing.
const SCREEN_SHARING_SIMULCAST_ENCODINGS = [
  {
    dtx: true,
    maxBitrate: 1500000
  },
  {
    dtx: true,
    maxBitrate: 6000000
  }
];
// Used for VP9 screen sharing.
const SCREEN_SHARING_SVC_ENCODINGS = [
  {
    scalabilityMode: 'S3T3',
    dtx: true
  }
];

class Room extends nodefony.Service {
  constructor(id, mediasoup, options, container) {
    let defaultOpt = nodefony.extend({}, defaultOptions);
    super("Room", container, null, nodefony.extend({}, defaultOpt, options));
    this.id = id;
    this.mediasoup = mediasoup;
    this.handlerName = mediasoupClient.detectDevice();
    this.closed = false;
    this.displayName = this.options.displayName || id;

    this.consumers = null;
    this.dataConsumers = null;
    this.webcams = null;

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
    this.mediaStream = new nodefony.medias.MediaStream(null, {}, this.container);
    this.listenMediaSoupEvents();
  }

  init() {
    this.log(`Initialize room ${this.id}`, "DEBUG");
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
    this.externalVideo = null;
    this.externalVideoStream = null;

    this.callbackTransportConnect = null;
    this.errbackTransportConnect = null;
    this.callbackTransportProcude = null;
    this.errbackTransportProcude = null;
    this.callbackTransportProcudeData = null;
    this.errbackTransportProcudeData = null;
    this.callbackTransportConsume = null;
    this.errbackTransportConsume = null;
  }

  listenMediaSoupEvents() {
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
      }
      if (message.data.type === "consuming") {
        this.recvTransport = await this.consume(message.data);
      }
    });
    this.mediasoup.on("join", async (message) => {
      this.log(`Event : join `, "DEBUG");
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
    });
    this.mediasoup.on("connectWebRtcTransport", async (message) => {
      if (message.error) {
        this.log(message.error, "ERROR");
        if (message.data.type === "producing") {
          this.errbackTransportConnect(message.error);
        } else {
          this.errbackTransportConsume(message.error);
        }
        return;
      }
      if (message.data.type === "producing") {
        return this.callbackTransportConnect();
      } else {
        return this.callbackTransportConsume();
      }
    });
    this.mediasoup.on("produce", async (message) => {
      if (message.error) {
        this.log(message.error, "ERROR");
        this.errbackTransportProcude(message.error);
        return;
      }
      return this.callbackTransportProcude(message.data.id)
    });
    this.mediasoup.on("producedata", async (message) => {
      if (message.error) {
        this.log(message.error, "ERROR");
        this.callbackTransportProcudeData(message.error);
        return;
      }
      return this.errbackTransportProcudeData(message.data.id)
    });
    this.mediasoup.on("notify", async (message) => {
      this.log(message.data, "INFO");
    });
  }

  async initTransport() {
    try {
      this.mediasoupDevice = await this.createDevice();
      this.log(`Device endpoint load routerRtpCapabilities `, "DEBUG");
      // Create mediasoup Transport for sending (to produce)
      if (this.options.produce) {
        this.createWebRtcTransport(true, false)
      }
      // Create mediasoup Transport for sending (to consume).
      if (this.options.consume) {
        this.createWebRtcTransport(false, true)
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

  join() {
    // Join now into the room.
    // NOTE: Don't send our RTP capabilities if we don't want to consume.
    return this.mediasoup.send('join', {
      displayName: this.displayName,
      device: this.mediasoup.deviceInfo,
      rtpCapabilities: this.consume ?
        this.mediasoupDevice.rtpCapabilities : undefined,
      sctpCapabilities: this.useDataChannel && this.consume ?
        this.mediasoupDevice.sctpCapabilities : undefined
    });
  }

  close() {
    this.log(`Closing room `);
    // Close mediasoup Transports.
    if (this.sendTransport) {
      this.sendTransport.close();
    }
    if (this.recvTransport) {
      this.recvTransport.close();
    }
    this.closed = true;
    this.init();
  }

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

  async createDevice() {
    const device = new mediasoupClient.Device({
      handlerName: this.handlerName
    });
    await device.load({
      routerRtpCapabilities: this.routerRtpCapabilities
    });
    return device;
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
    }
    return this.mediasoup.send('createWebRtcTransport', data);
  }

  async produce(transportInfo) {
    return new Promise((resolve, reject) => {
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
        this.log(`Produce Webrtc Transport ${transport.id} : Event connect `, "DEBUG");
        this.callbackTransportConnect = callback;
        this.errbackTransportConnect = errback;
        this.mediasoup.send('connectWebRtcTransport', {
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
        this.log(`Produce Webrtc Transport ${transport.id} : Event pruduce `, "DEBUG");
        this.callbackTransportProcude = callback;
        this.errbackTransportProcude = errback;
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
        this.log(`"producedata" event: [sctpStreamParameters:${sctpStreamParameters}, appData:${appData}]`, "DEBUG");
        // eslint-disable-next-line no-shadow
        this.callbackTransportProcudeData = callback;
        this.errbackTransportProcudeData = errback;
        return this.mediasoup.send('producedata', {
          transportId: transport.id,
          sctpStreamParameters,
          label,
          protocol,
          appData
        });
      });
      return resolve(transport);
    });
  }

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
      this.callbackTransportConsume = callback;
      this.errbackTransportConsume = errback;
      return this.mediasoup.send('connectWebRtcTransport', {
        type: "consoming",
        transportId: transport.id,
        dtlsParameters
      });
    });
    return transport;
  }

  setRouterRtpCapabilities(message) {
    this.log("setRouterRtpCapabilities", "DEBUG");
    this.routerRtpCapabilities = message.router.rtpCapabilities;
  }

  getUserMedia(settings = {}, element = null) {
    return new Promise((resolve, reject) => {
      if (element) {
        this.mediaStream.mediaElement = element
      }
      this.externalVideo = this.mediaStream.mediaElement;
      this.externalVideoStream = this.mediaStream.stream;
      return this.mediaStream.getUserMedia(settings)
        .then(async (stream) => {
          await this.mediaStream.attachMediaStream()
          this.log(`getUserMedia video : ${settings.video} audio : ${settings.audio}`, "DEBUG");
          return resolve(stream)
        })
        .catch((e) => {
          return reject(e)
        });
    });
  }

  getUserScreen(settings = {}, element = null) {
    return new Promise((resolve, reject) => {
      if (element) {
        this.mediaStream.mediaElement = element
      }
      this.externalVideo = this.mediaStream.mediaElement;
      this.externalVideoStream = this.mediaStream.stream;
      return this.mediaStream.getUserScreen(settings)
        .then(async (stream) => {
          await this.mediaStream.attachMediaStream();
          return resolve(stream)
        })
        .catch((e) => {
          return reject(e)
        });
    });
  }

  //audio
  async enableMic() {
    this.log('enableMic()', "DEBUG");
    if (this.micProducer)
      return this.micProducer;
    if (!this.mediasoupDevice.canProduce('audio')) {
      this.log('enableMic() | cannot produce audio', "ERROR");
      return;
    }
    let track;
    try {
      if (!this.externalVideo) {
        await this.getUserMedia({
          audio: true
        });
      }
      track = this.mediaStream.getAudioTracks()[0];
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
  async muteMic() {}
  async unmuteMic() {}
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
        await this.getUserMedia({
          video: {
            deviceId: {
              ideal: device.deviceId
            },
            ...VIDEO_CONSTRAINS[resolution]
          }
        });
        track = this.mediaStream.getVideoTracks()[0];
      } else {
        device = {
          label: 'external video'
        };
        //const stream = await this.getExternalVideoStream();
        track = this.mediaStream.getVideoTracks()[0].clone();
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
      return this.webcamProducer;
    } catch (e) {
      this.log(e, "ERROR");
      if (track)
        track.stop();
    }
  }
  async updateWebcams() {
    this.log('updateWebcams()', "DEBUG");
    // Reset the list.
    this.webcams = new Map();
    this.log('_updateWebcams() | calling enumerateDevices()', "DEBUG");
    const devices = await navigator.mediaDevices.enumerateDevices();

    for (const device of devices) {
      if (device.kind !== 'videoinput')
        continue;
      this.webcams.set(device.deviceId, device);
    }
    const array = Array.from(this.webcams.values());
    const len = array.length;
    const currentWebcamId =
      this.webcam.device ? this.webcam.device.deviceId : null;
    this.log('updateWebcams()', "DEBUG");
    this.log(array, "DEBUG")
    if (len === 0)
      this.webcam.device = null;
    else if (!this.webcams.has(currentWebcamId))
      this.webcam.device = array[0];
    return this.webcam;
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
