const Broadcaster = require(path.resolve(__dirname, "broadcaster.js"));

class Room extends nodefony.Service {
  constructor(roomid, worker, router, bot, container) {
    super(`Room ${roomid}`, container, null);
    this.id = roomid;
    this.peersService = this.get("Peers");
    this.mediasoupService = this.get("Mediasoup");
    this.closed = false;
    this.worker = worker;
    this.router = router;
    this.bot = bot;
    this.peers = new Map();
    this.broadcasters = new Map();
    this.webRtcTransportOptions = this.mediasoupService.config.webRtcTransportOptions;
    this.plainTransportOptions = this.mediasoupService.config.plainTransportOptions;
    this.recordPlainTransportOptions = this.mediasoupService.config.recordPlainTransportOptions;
    // Create a mediasoup AudioLevelObserver.
    this.AudioLevelOptions = {
      maxEntries: 1,
      threshold: -80,
      interval: 800
    };
    this.handleAudioLevelObserver();
  }

  async logStatus() {
    //let status = `logStatus() [roomId:${this.id}, Peers:${this.peers.length}, mediasoup Transports:${this.router._transports.size}]`;
    //this.log(status);
    return {
      roomid: this.id,
      peers: this.peers.size,
      worker: {
        pid: this.worker.pid,
        usage: await this.worker.getResourceUsage()
      },
      router: {
        id: this.router.id,
        transports: this.router._transports.size,
        capabilities: this.getRouterRtpCapabilities()
      },
      broadcasters: this.broadcasters.size
    };
  }

  getJoinedPeers({
    excludePeer = null
  } = {}) {
    let tab = [];
    this.peers.forEach((peer) => {
      if (peer.joined && peer !== excludePeer) {
        tab.push(peer);
      }
    });
    return tab;
  }

  notifyAllPeers(event, data, {
    excludePeer = null
  } = {}) {
    this.peers.forEach((peer) => {
      if (peer.joined && peer !== excludePeer) {
        peer.notify(this, event, data);
      }
    });
  }

  async createPeer(peerid, transport) {
    let peer = null;
    if (this.hasPeer(peerid)) {
      let msg = `There is already Peer with same peerId, closing it [peerId:${peerid}]`;
      this.log(msg, "WARNING");
      peer = this.getPeer(peerid);
      await peer.close();
    }
    peer = await this.peersService.create(peerid, transport);
    peer.once("close", async () => {
      if (this.closed) {
        return;
      }
      this.log(`Peer "close" event [peerId:${peer.id}]`);
      // If the Peer was joined, notify all Peers.
      if (peer.joined) {
        for (const otherPeer of this.getJoinedPeers({
            excludePeer: peer
          })) {
          otherPeer.notify(this, "peerClosed", {
            peerId: peer.id
          });
        }
      }
      // If this is the latest Peer in the room, close the room.
      if (this.peers.size === 0) {
        this.log(`last Peer in the room left, closing the room [roomId:${this.id}]`);
        await this.close();
      }
      this.deletePeer(peerid);
      this.fire("peerQuit", peer);
    });
    this.setPeer(peerid, peer);
    this.fire("peerEnter", peer);
    return peer;
  }

  hasPeer(peerid) {
    return this.peers.has(peerid);
  }

  getPeer(peerid) {
    return this.peers.get(peerid);
  }

  setPeer(peerid, peer) {
    this.peers.set(peerid, peer);
  }

  deletePeer(peerid) {
    this.peers.delete(peerid);
  }

  getPeers() {
    let peers = [];
    for (const peer of this.peers) {
      peers.push(peer[1].peerInfos())
      /*peers.push({
        id: peer[1].id,
        status: peer[1].status,
        joined: peer[1].joined,
        displayName: peer[1].displayName,
        user: peer[1].user
      });*/
    }
    return peers;
  }

  hasBroadcaster(peerid) {
    return this.broadcasters.has(peerid);
  }

  getBroadcaster(peerid) {
    return this.broadcasters.get(peerid);
  }

  setBroadcaster(peerid, peer) {
    this.broadcasters.set(peerid, peer);
  }

  deleteBroadcaster(peerid) {
    this.broadcasters.delete(peerid);
  }

  async handleAudioLevelObserver() {
    // Create a mediasoup AudioLevelObserver.
    this.audioLevelObserver = await this.router.createAudioLevelObserver(this.AudioLevelOptions);
    this.audioLevelObserver.on('volumes', (volumes) => {
      const {
        producer,
        volume
      } = volumes[0];
      this.log(`audioLevelObserver : volumes event  [producerId : ${producer.id}, volume : ${volume}]`, "DEBUG");
      this.notifyAllPeers('activeSpeaker', {
        peerId: producer.appData.peerId,
        volume: volume
      });
    });
    this.audioLevelObserver.on('silence', () => {
      this.log(`audioLevelObserver : silence event`, "DEBUG");
      this.notifyAllPeers('activeSpeaker', {
        peerId: producer.appData.peerId
      });
    });
  }

  getRouterRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  async close() {
    if (this.router) {
      await this.router.close();
    }
    if (this.bot && this.bot.close) {
      await this.bot.close();
    }
    if (this.peers.size) {
      this.peers.forEach((peer) => {
        return peer.close();
      });
    }
    this.closed = true;
    return this.fire("close", this);
  }

  authorisePeer(peer) {
    if (peer.status === 'waiting') {
      peer.status = "authorised";
      this.fire("authorise", peer, this);
      return peer.status;
    }
  }
  unauthorisePeer(peer) {
    if (peer.status === 'waiting') {
      peer.status = "unauthorised";
      this.fire("unauthorise", peer, this);
      return peer.status;
    }
  }

  async join(peer, message) {
    if (peer.joined) {
      throw new Error('Peer already joined');
    }
    const {
      displayName,
      device,
      rtpCapabilities,
      sctpCapabilities
    } = message.data;
    peer.displayName = displayName;
    peer.device = device;
    peer.rtpCapabilities = rtpCapabilities;
    peer.sctpCapabilities = sctpCapabilities;
    const joinedPeers = [
      ...this.getJoinedPeers(),
      ...this.broadcasters.values()
    ];
    //this.log(peer.rtpCapabilities, "DEBUG", `${peer.id} rtpCapabilities`)
    //this.log(peer.sctpCapabilities, "DEBUG", `${peer.id} sctpCapabilities`)
    // Reply now the request with the list of joined peers (all but the new one).
    // Mark the new Peer as joined.
    peer.joined = true;
    peer.status = "joined";
    this.fire("join", peer);
    const peerInfos = joinedPeers
      .filter((joinedPeer) => joinedPeer.id !== peer.id)
      .map((joinedPeer) => (joinedPeer.peerInfos() ) );
    return peerInfos;
  }

  async createTransport(transportType, config) {
    switch (transportType) {
    case 'webrtc':
    case 'webRtc':
      return await this.createWebRtcTransport(config);
    case 'plain':
      return await this.createPlainRtpTransport(config);
    }
  }
  async connectTransport(transportType, transport, options) {
    switch (transportType) {
    case 'webRtc':
    case 'webrtc':
      return await this.connecWebRtcTransport(transport, options);
    case 'plain':
      return await this.connecPlainRtpTransport(transport, options);
    }
  }

  async createPlainRtpTransport(config) {
    return await this.router.createPlainRtpTransport(config);
  }

  async connecPlainRtpTransport(transport, options) {
    return await transport.connect(options);
  }

  async createWebRtcTransport(config) {
    const {
      forceTcp,
      producing,
      consuming,
      sctpCapabilities
    } = config;
    const webRtcTransportOptions = {
      ...this.webRtcTransportOptions,
      enableSctp: Boolean(sctpCapabilities),
      numSctpStreams: (sctpCapabilities || {}).numStreams,
      appData: {
        producing,
        consuming
      }
    };
    if (forceTcp) {
      webRtcTransportOptions.enableUdp = false;
      webRtcTransportOptions.enableTcp = true;
    }
    try {
      const transport = await this.router.createWebRtcTransport(
        webRtcTransportOptions);
      transport.on('sctpstatechange', (sctpState) => {
        this.log(`WebRtcTransport "sctpstatechange" event [sctpState: ${sctpState}]`, "DEBUG");
      });
      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'failed' || dtlsState === 'closed') {
          this.log(`WebRtcTransport "dtlsstatechange" event [dtlsState: ${dtlsState}]`, "DEBUG");
        }
      });
      // NOTE: For testing.
      //await transport.enableTraceEvent(['bwe']);
      const {
        maxIncomingBitrate
      } = this.webRtcTransportOptions;
      // If set, apply max incoming bitrate limit.
      if (maxIncomingBitrate) {
        try {
          await transport.setMaxIncomingBitrate(maxIncomingBitrate);
        } catch (error) {}
      }
      return transport;
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async connecWebRtcTransport(transport, dtlsParameters) {
    try {
      if (!transport) {
        throw new Error(`no transport  found`);
      }
      return await transport.connect({
        dtlsParameters
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  async createProducer(peer, data) {
    if (!peer.joined) {
      throw new Error('Peer not yet joined');
    }
    const {
      transportId,
      kind,
      rtpParameters
    } = data;
    let {
      appData
    } = data;
    const transport = peer.transports.get(transportId);
    if (!transport) {
      throw new Error(`transport with id "${transportId}" not found`);
    }
    appData = { ...appData,
      peerId: peer.id
    };
    const producer = await transport.produce({
      kind,
      rtpParameters,
      appData
      // keyFrameRequestDelay: 5000
    });
    peer.setProducer(producer.id, producer)
    // Set Producer events.
    producer.on('score', (score) => {
      // logger.debug(
      // 	'producer "score" event [producerId:%s, score:%o]',
      // 	producer.id, score);
      peer.notify(this, 'producerScore', {
        producerId: producer.id,
        score
      });
    });
    producer.on('videoorientationchange', (videoOrientation) => {
      this.log(`producer "videoorientationchange" event [producerId:${producer.id}] `, "DEBUG");
      this.log(videoOrientation, "DEBUG");
    });
    // NOTE: For testing.
    // await producer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
    // await producer.enableTraceEvent([ 'pli', 'fir' ]);
    // await producer.enableTraceEvent([ 'keyframe' ]);
    producer.on('trace', (trace) => {
      this.log(`producer "trace" event [producerId:${producer.id}, trace.type:${trace.type}`, "DEBUG");
      this.log(trace, "DEBUG");
    });

    producer.observer.on("close", ()=>{
      //this.fire('producerclose', producer);
    }),

    producer.observer.on('resume', () => {
      this.fire('producerresume', producer);
    });
    producer.observer.on('pause', () => {
      this.fire('producerpause', producer)
    });
    this.fire('producercreate', producer);
    return producer;
  }

  async createConsumer({
    consumerPeer,
    producerPeer,
    producer
  }) {
    // Optimization:
    // - Create the server-side Consumer in paused mode.
    // - Tell its Peer about it and wait for its response.
    // - Upon receipt of the response, resume the server-side Consumer.
    // - If video, this will mean a single key frame requested by the
    //   server-side Consumer (when resuming it).
    // - If audio (or video), it will avoid that RTP packets are received by the
    //   remote endpoint *before* the Consumer is locally created in the endpoint
    //   (and before the local SDP O/A procedure ends). If that happens (RTP
    //   packets are received before the SDP O/A is done) the PeerConnection may
    //   fail to associate the RTP stream.

    // NOTE: Don't create the Consumer if the remote Peer cannot consume it.
    let canConsume = this.router.canConsume({
      producerId: producer.id,
      rtpCapabilities: consumerPeer.rtpCapabilities
    });
    if (!consumerPeer.rtpCapabilities || !canConsume) {
      this.log(`Peer : ${consumerPeer.id} canConsume :  ${canConsume} `, "WARNING");
      this.log(`rtpCapabilities : ${consumerPeer.rtpCapabilities}`, "WARNING");
      return;
    }
    // Must take the Transport the remote Peer is using for consuming.
    const transport = Array.from(consumerPeer.transports.values())
      .find((t) => t.appData.consuming);

    // This should not happen.
    if (!transport) {
      this.log('createConsumer() | Transport for consuming not found', "WARNING");
      return;
    }
    // Create the Consumer in paused mode.
    let consumer;
    try {
      consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: consumerPeer.rtpCapabilities,
        paused: true
      });
    } catch (error) {
      this.log('_createConsumer() | transport.consume()', "ERROR");
      this.log(error, 'ERROR');
      return;
    }
    // Store the Consumer in peer .
    //consumerPeer.consumers.set(consumer.id, consumer);
    consumerPeer.setConsumer(consumer.id, consumer);
    // Set Consumer events.
    consumer.on('transportclose', () => {
      // Remove from its map.
      consumerPeer.deleteConsumer(consumer.id);
    });
    consumer.on('producerclose', () => {
      // Remove from its map.
      consumerPeer.deleteConsumer(consumer.id);
      consumerPeer.notify(this, 'consumerClosed', {
        consumerId: consumer.id
      });
    });
    consumer.on('producerpause', () => {
      consumerPeer.notify(this, 'consumerPaused', {
        consumerId: consumer.id
      });
    });
    consumer.on('producerresume', () => {
      consumerPeer.notify(this, 'consumerResumed', {
        consumerId: consumer.id
      });
    });
    consumer.on('score', (score) => {
      // logger.debug(
      // 	'consumer "score" event [consumerId:%s, score:%o]',
      // 	consumer.id, score);
      consumerPeer.notify(this, 'consumerScore', {
        consumerId: consumer.id,
        score
      });
    });
    consumer.on('layerschange', (layers) => {
      consumerPeer.notify(this, 'consumerLayersChanged', {
        consumerId: consumer.id,
        spatialLayer: layers ? layers.spatialLayer : null,
        temporalLayer: layers ? layers.temporalLayer : null
      });
    });
    // NOTE: For testing.
    // await consumer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
    // await consumer.enableTraceEvent([ 'pli', 'fir' ]);
    // await consumer.enableTraceEvent([ 'keyframe' ]);
    consumer.on('trace', (trace) => {
      this.log(`'consumer "trace" event [producerId:${consumer.id}, trace.type:${trace.type}]`, "DEBUG");
      this.log(trace, "DEBUG");
    });
    // Send a protoo request to the remote Peer with Consumer parameters.
    try {
      // Now that we got the positive response from the remote endpoint, resume
      // the Consumer so the remote endpoint will receive the a first RTP packet
      // of this new stream once its PeerConnection is already ready to process
      // and associate it.
      await consumer.resume();
      //console.log(consumer)
      consumerPeer.send(this, 'newConsumer', {
        peerId: producerPeer.id,
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        appData: producer.appData,
        producerPaused: consumer.producerPaused
      });
      consumerPeer.notify(this, 'consumerScore', {
        consumerId: consumer.id,
        score: consumer.score
      });
      return consumer;
    } catch (error) {
      this.log('_createConsumer() | failed', "WARNING");
      this.log(error, "ERROR");
    }
  }

  async createDataConsumer(dataConsumerPeer, dataProducerPeer, dataProducer) {
    // NOTE: Don't create the DataConsumer if the remote Peer cannot consume it.
    if (!dataConsumerPeer.sctpCapabilities) {
      return;
    }
    // Must take the Transport the remote Peer is using for consuming.
    const transport = Array.from(dataConsumerPeer.transports.values())
      .find((t) => t.appData.consuming);
    // This should not happen.
    if (!transport) {
      this.log('_createDataConsumer() | Transport for consuming not found', "WARNING");
      return;
    }
    // Create the DataConsumer.
    let dataConsumer;
    try {
      dataConsumer = await transport.consumeData({
        dataProducerId: dataProducer.id
      });
    } catch (error) {
      this.log('_createDataConsumer() | transport.consumeData()', "ERROR");
      this.log(error, "ERROR")
    }
    // Store the DataConsumer  dataConsumerPeer  peer.
    dataConsumerPeer.dataConsumers.set(dataConsumer.id, dataConsumer);
    // Set DataConsumer events.
    dataConsumer.on('transportclose', () => {
      // Remove from its map.
      dataConsumerPeer.dataConsumers.delete(dataConsumer.id);
    });
    dataConsumer.on('dataproducerclose', () => {
      // Remove from its map.
      dataConsumerPeer.dataConsumers.delete(dataConsumer.id);
      dataConsumerPeer.notify(this, 'dataConsumerClosed', {
          dataConsumerId: dataConsumer.id
        })
        .catch(() => {});
    });
    // Send a protoo request to the remote Peer with Consumer parameters.
    try {
      dataConsumerPeer.send(this, 'newDataConsumer', {
        // This is null for bot DataProducer.
        peerId: dataProducerPeer ? dataProducerPeer.id : null,
        dataProducerId: dataProducer.id,
        id: dataConsumer.id,
        sctpStreamParameters: dataConsumer.sctpStreamParameters,
        label: dataConsumer.label,
        protocol: dataConsumer.protocol,
        appData: dataProducer.appData
      });
    } catch (error) {
      this.log('_createDataConsumer()', "WARNING");
      this.log(error, "ERROR")
    }
    return dataConsumer;
  }

  // BROADCASTER
  async createBroadcaster(id, displayName, device = {}, rtpCapabilities = null) {
    if (typeof id !== 'string' || !id) {
      throw new TypeError('missing query.id');
    } else if (typeof displayName !== 'string' || !displayName) {
      throw new TypeError('missing query.displayName');
    } else if (typeof device.name !== 'string' || !device.name) {
      throw new TypeError('missing query.device.name');
    } else if (rtpCapabilities && typeof rtpCapabilities !== 'object') {
      throw new TypeError('wrong query.rtpCapabilities');
    }
    if (this.broadcasters.has(id)) {
      throw new Error(`broadcaster with id "${id}" already exists`);
    }
    const broadcaster = new Broadcaster(id, displayName, device, rtpCapabilities, this.container);
    this.broadcasters.set(broadcaster.id, broadcaster);
    this.notifyAllPeers("newPeer", {
      id: broadcaster.id,
      displayName: broadcaster.displayName,
      device: broadcaster.device
    });
    let peers = this.getJoinedPeers();
    if (rtpCapabilities) {
      for (const joinedPeer of peers) {
        const peerInfo = {
          id: joinedPeer.id,
          displayName: joinedPeer.displayName,
          device: joinedPeer.device,
          producers: []
        };
        for (const producer of joinedPeer.producers.values()) {
          // Ignore Producers that the Broadcaster cannot consume.
          if (!this.router.canConsume({
              producerId: producer.id,
              rtpCapabilities
            })) {
            continue;
          }
          peerInfo.producers.push({
            id: producer.id,
            kind: producer.kind
          });
        }
        broadcaster.peerInfos.push(peerInfo);
      }
    }
    return broadcaster;
  }

  async createBroadcasterTransport(broadcasterId, type, rtcpMux = false, comedia = true, sctpCapabilities = null) {
    const broadcaster = this.broadcasters.get(broadcasterId);
    switch (type) {
    case 'webrtc':
      {
        const webRtcTransportOptions = {
          ...this.webRtcTransportOptions,
          enableSctp: Boolean(sctpCapabilities),
          numSctpStreams: (sctpCapabilities || {}).numStreams
        };

        const transport = await this.router.createWebRtcTransport(
          webRtcTransportOptions);
        // Store it.
        broadcaster.transports.set(transport.id, transport);

        return {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
          sctpParameters: transport.sctpParameters
        };
      }
    case 'plain':
      {
        const plainTransportOptions = {
          ...this.plainTransportOptions,
          rtcpMux: rtcpMux,
          comedia: comedia
        };
        const transport = await this.router.createPlainTransport(
          plainTransportOptions);
        // Store it.
        broadcaster.transports.set(transport.id, transport);
        return {
          id: transport.id,
          ip: transport.tuple.localIp,
          port: transport.tuple.localPort,
          rtcpPort: transport.rtcpTuple ? transport.rtcpTuple.localPort : undefined
        };
      }
    default:
      {
        throw new TypeError('invalid type');
      }
    }
  }

  async createBroadcasterProducer(broadcasterId, transportId, kind, rtpParameters) {
    const broadcaster = this.broadcasters.get(broadcasterId);
    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`);
    }
    const transport = broadcaster.transports.get(transportId);
    if (!transport) {
      throw new Error(`transport with id "${transportId}" does not exist`);
    }
    const producer =
      await transport.produce({
        kind,
        rtpParameters
      });
    // Store it.
    broadcaster.producers.set(producer.id, producer);
    // Set Producer events.
    // producer.on('score', (score) =>
    // {
    // 	logger.debug(
    // 		'broadcaster producer "score" event [producerId:%s, score:%o]',
    // 		producer.id, score);
    // });
    producer.on('videoorientationchange', (videoOrientation) => {
      this.log(`broadcaster producer "videoorientationchange" event [producerId:${producer.id}, videoOrientation:${videoOrientation}]`, "DEBUG");
    });

    // Optimization: Create a server-side Consumer for each Peer.
    for (const peer of this.getJoinedPeers()) {
      this.createConsumer({
        consumerPeer: peer,
        producerPeer: broadcaster,
        producer
      });
    }

    // Add into the audioLevelObserver.
    if (producer.kind === 'audio') {
      this.audioLevelObserver.addProducer({
          producerId: producer.id
        })
        .catch(() => {});
    }
    return producer;
  }

  deleteBroadcaster(broadcasterId) {
    const broadcaster = this.broadcasters.get(broadcasterId);
    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`);
    }
    for (const transport of broadcaster.transports.values()) {
      transport.close();
    }
    this.broadcasters.delete(broadcasterId);
    this.notifyAllPeers("peerClosed", {
      peerId: broadcasterId
    });
    return broadcasterId;
  }

  // record
  async publishProducerRtpStream(peer, producer) {
    const conf = {
      ...this.recordPlainTransportOptions
    }
    const rtpTransport = await this.createTransport('plain', conf);
    // Set the receiver RTP ports
    const remoteRtpPort = await this.mediasoupService.getPort(conf.listenIp);
    peer.remotePorts.push(remoteRtpPort);
    let remoteRtcpPort;
    // If rtpTransport rtcpMux is false also set the receiver RTCP ports
    if (!conf.rtcpMux) {
      remoteRtcpPort = await this.mediasoupService.getPort();
      peer.remotePorts.push(remoteRtcpPort);
    }
    // Connect the mediasoup RTP transport to the ports used by GStreamer
    await rtpTransport.connect({
      ip: conf.listenIp,
      port: remoteRtpPort,
      rtcpPort: remoteRtcpPort
    });
    peer.setTransport(rtpTransport);
    const codecs = [];
    // Codec passed to the RTP Consumer must match the codec in the Mediasoup router rtpCapabilities
    const routerCodec = this.router.rtpCapabilities.codecs.find(
      codec => codec.kind === producer.kind
    );
    codecs.push(routerCodec);
    const rtpCapabilities = {
      codecs,
      rtcpFeedback: []
    };
    // Start the consumer paused
    // Once the gstreamer process is ready to consume resume and send a keyframe
    const rtpConsumer = await rtpTransport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: true
    });
    peer.consumers.set(rtpConsumer.id, rtpConsumer);
    const infos = {
      remoteRtpPort,
      remoteRtcpPort,
      localRtcpPort: rtpTransport.rtcpTuple ? rtpTransport.rtcpTuple.localPort : undefined,
      rtpCapabilities,
      rtpParameters: rtpConsumer.rtpParameters
    };
    this.log(infos);
    return {
      infos,
      rtpTransport,
      rtpConsumer
    };
  }
}

module.exports = Room;
