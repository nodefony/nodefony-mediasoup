class Room extends nodefony.Service {
  constructor(roomid, worker, router, audioLevelObserver, bot, container) {
    super(`Room ${roomid}`, container, null);
    this.id = roomid;
    this.closed = false;
    this.worker = worker;
    this.router = router;
    this.bot = bot;
    this.audioLevelObserver = audioLevelObserver;
    this.peersService = this.get("Peers");
    this.peers = new Map();
    this.broadcasters = new Map();
    this.handleAudioLevelObserver();
    this.mediasoupService = this.get("Mediasoup");
    this.webRtcTransportOptions = this.mediasoupService.config.webRtcTransportOptions
  }

  async logStatus() {
    let status = `logStatus() [roomId:${this.id}, Peers:${this.peers.length}, mediasoup Transports:${this.router._transports.size}]`;
    this.log(status);
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
    }
  }

  getJoinedPeers({
    excludePeer = undefined
  } = {}) {
    let tab = [];
    this.peers.forEach((peer, i) => {
      if (peer.joined && peer !== excludePeer) {
        tab.push(peer)
      }
    });
    return tab;
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
          otherPeer.notify("peerClosed", {
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
    });
    this.setPeer(peerid, peer);
    return peer;
  }

  hasPeer(peerid) {
    return this.peers.has(peerid)
  }

  getPeer(peerid) {
    return this.peers.get(peerid)
  }

  setPeer(peerid, peer) {
    this.peers.set(peerid, peer);
  }

  deletePeer(peerid) {
    this.peers.delete(peerid);
  }

  handleAudioLevelObserver() {
    this.audioLevelObserver.on('volumes', (volumes) => {

    });
    this.audioLevelObserver.on('silence', () => {

    });
  }

  getRouterRtpCapabilities() {
    return this.router.rtpCapabilities;
  }



  async close() {
    if (this.router) {
      await this.router.close();
    }
    if (this.bot) {
      await this.bot.close();
    }
    if (this.peers.size) {
      this.peers.forEach((peer, key, map) => {
        return peer.close();
      })
    }
    this.closed = true;
    return this.fire("close", this);
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
    // Store client data into the protoo Peer data object.
    peer.joined = true;
    peer.displayName = displayName;
    peer.device = device;
    peer.rtpCapabilities = rtpCapabilities;
    peer.sctpCapabilities = sctpCapabilities;
    const joinedPeers = [
			...this.getJoinedPeers(),
			...this.broadcasters.values()
		];
    // Reply now the request with the list of joined peers (all but the new one).
    const peerInfos = joinedPeers
      .filter((joinedPeer) => joinedPeer.id !== peer.id)
      .map((joinedPeer) => ({
        id: joinedPeer.id,
        displayName: joinedPeer.displayName,
        device: joinedPeer.device
      }));

    // Mark the new Peer as joined.
    peer.joined = true;
    for (const joinedPeer of joinedPeers) {
      // Create Consumers for existing Producers.
      for (const producer of joinedPeer.producers.values()) {}
    }
    return peerInfos;
  }

  async createWebRtcTransport(peer, message) {
    const {
      forceTcp,
      producing,
      consuming,
      sctpCapabilities
    } = message.data;
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
      // await transport.enableTraceEvent([ 'probation', 'bwe' ]);
      await transport.enableTraceEvent(['bwe']);
      transport.on('trace', (trace) => {
        this.log(`transport "trace" event [transportId:${transport.id}, trace.type:${trace.type} ]`, "DEBUG");
        this.log(trace, "DEBUG");
        peer.notify('downlinkBwe', {
          desiredBitrate: trace.info.desiredBitrate,
          effectiveDesiredBitrate: trace.info.effectiveDesiredBitrate,
          availableBitrate: trace.info.availableBitrate
        });
      });
      peer.transports.set(transport.id, transport);
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

  async connecWebRtcTransport(peer, data) {
    const {
      transportId,
      dtlsParameters
    } = data;
    try {
      const transport = peer.transports.get(transportId);
      if (!transport) {
        throw new Error(`transport with id "${transportId}" not found`);
      }
      return await transport.connect({
        dtlsParameters
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e
    }
  }

  async createProducer(peer, data) {
    if (!peer.joined)
      throw new Error('Peer not yet joined');
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
    peer.producers.set(producer.id, producer);
    // Set Producer events.
    producer.on('score', (score) => {
      // logger.debug(
      // 	'producer "score" event [producerId:%s, score:%o]',
      // 	producer.id, score);
      peer.notify('producerScore', {
        producerId: producer.id,
        score
      });
    });
    producer.on('videoorientationchange', (videoOrientation) => {
      this.log(`producer "videoorientationchange" event [producerId:${producerId}] `, "DEBUG");
      this.log(videoOrientation, "DEBUG");
    });
    // NOTE: For testing.
    // await producer.enableTraceEvent([ 'rtp', 'keyframe', 'nack', 'pli', 'fir' ]);
    // await producer.enableTraceEvent([ 'pli', 'fir' ]);
    // await producer.enableTraceEvent([ 'keyframe' ]);
    producer.on('trace', (trace) => {
      this.log(`producer "trace" event [producerId:${producer.id}, trace.type:${trace.type}`, "DEBUG");
      this.log(trace, "DEBUG")
    });
    return producer
  }

  async createConsumer(consumerPeer, producerPeer, producer) {

  }

  async createDataConsumer(dataConsumerPeer, dataProducerPeer, dataProducer) {

  }



}

module.exports = Room;
