/**
 *
 *
 *	nodefony-mediasoup CONFIG BUNDLE  mediasoup-bundle
 *
 * ===============================================================================
 *
 *  Copyright © 2020/2020        Christophe CAMENSULI | ccamensuli@gmail.com
 *
 * ===============================================================================
 *
 *        GENERATE BY nodefony-mediasoup BUILDER
 */

const calculNbWorker= () =>{
  const os = require('os');
  let cpus = parseInt(Object.keys(os.cpus()).length ,10);
  // keep one process for nodefony framwork
  if( cpus > 1){
    return cpus - 1;
  }
  return cpus;
}

// default
let ip = kernel.settings.system.domain;
let anounceIp = kernel.settings.system.domain;
let nbWorkers = calculNbWorker();
let gcIntervalTime = null;
let workerSettings = {
  logLevel: 'debug',
  logTags: [
    'info',
    'ice',
    'dtls',
    'rtp',
    'srtp',
    'rtcp',
    'rtx',
    'bwe',
    'score',
    'simulcast',
    'svc',
    'sctp'
  ],
  rtcMinPort: 40000,
  rtcMaxPort: 49999
} ;

// you can change default for production usage
if(kernel.environement === "prod"){
  ip = kernel.settings.system.domain;
  anounceIp = kernel.settings.system.domain;
  gcIntervalTime = 1000*60*60;  // ms => garbage collector 0 or null for disabled
  workerSettings ={
    logLevel: 'none',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
      'rtx',
      'bwe',
      'score',
      'simulcast',
      'svc',
      'sctp'
    ],
    rtcMinPort: 40000,
    rtcMaxPort: 49999
  }
}

module.exports = {
  type: "sandbox",
  locale: "en_en",

  /**
   *    WATCHERS
   *
   *  watchers Listen to changes, deletion, renaming of files and directories
   *  of different components
   *
   *  For watch all components
   *      watch:                    true
   *  or
   *      watch:{
   *        controller:             true,
   *        config:                 true,        // only routing and services
   *        views:                  true,
   *        translations:           true,
   *        webpack:                true
   *      }
   *
   */
  watch: false,

  /**
   * DEV SERVER
   */
  devServer: {
    hot: false
  },

  /**
   *
   *	Insert here the bundle-specific configurations
   *
   *	You can also override config of another bundle
   *	with the name of the bundle
   *
   *	example : create an other database connector
   */

  // mediasoup settings.
  mediasoup: {
    gcIntervalTime: gcIntervalTime,  // ms => garbage collector 0 or null for disabled
    // Number of mediasoup workers to launch.
    numWorkers: nbWorkers,
    // mediasoup WorkerSettings.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WorkerSettings
    workerSettings: workerSettings,
    // mediasoup Router options.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#RouterOptions
    routerOptions: {
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
          parameters: {
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
          parameters: {
            'profile-id': 2,
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '4d0032',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000
          }
        },
        {
          kind: 'video',
          mimeType: 'video/h264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
            'x-google-start-bitrate': 1000
          }
        }
      ]
    },
    // mediasoup WebRtcTransport options for WebRTC endpoints (mediasoup-client,
    // libmediasoupclient).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
    webRtcTransportOptions: {
      listenIps: [
        {
          ip: ip,
          announcedIp: anounceIp
        }
      ],
      initialAvailableOutgoingBitrate: 1000000,
      minimumAvailableOutgoingBitrate: 600000,
      maxSctpMessageSize: 262144,
      // Additional options that are not part of WebRtcTransportOptions.
      maxIncomingBitrate: 1500000
    },
    // mediasoup PlainTransport options for legacy RTP endpoints (FFmpeg,
    // GStreamer).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#PlainTransportOptions
    plainTransportOptions: {
      listenIp: {
        ip: ip,
        announcedIp: anounceIp
      },
      maxSctpMessageSize: 262144
    },
    recordPlainTransportOptions:{
      listenIp: '127.0.0.1',
      rtcpMux: true,
      comedia: false
    }
  }
};
