const Room = require(path.resolve(__dirname, "..", "src", "room.js"))

class Rooms extends nodefony.Service {

  constructor(container) {
    super("Rooms", container);
    this.rooms = new Map();
    if (!this.kernel.ready) {
      this.kernel.once("onReady", () => {
        this.mediasoupService = this.get("Mediasoup");
        this.mediaRouterOptions = this.mediasoupService.config.routerOptions;
        this.botService = this.get("Bot");
        this.log(this.mediaRouterOptions, "DEBUG");
      });
    } else {
      this.mediasoupService = this.get("Mediasoup");
      this.mediaRouterOptions = this.mediasoupService.config.routerOptions;
      this.botService = this.get("Bot");
      this.log(this.mediaRouterOptions, "DEBUG");
    }
    this.AudioLevelOptions = {
      maxEntries: 1,
      threshold: -80,
      interval: 800
    }
  }

  create(worker, roomid, mediaCodecs = this.mediaRouterOptions.mediaCodecs, audioLevelOptions = this.AudioLevelOptions) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a mediasoup Router.
        console.log({
          mediaCodecs
        })
        const router = await worker.createRouter({
          mediaCodecs
        });
        // Create a mediasoup AudioLevelObserver.
        const audioLevelObserver = await router.createAudioLevelObserver(audioLevelOptions);
        // bot data
        const bot = await this.botService.create(router);
        const room = new Room(roomid, worker, router, audioLevelObserver, bot, this.container);
        this.setRoom(room.id, room);
        router.once("workerclose", async () => {
          return await this.closeRoom(roomid);
        });
        room.once("close", () => {
          this.deleteRoom(room.id);
        });
        return resolve(room);
      } catch (e) {
        return reject(e)
      }
    });
  }

  async handle(room, peer, message, context) {
    let transport = null;
    let transportId = null;
    let type = null;
    switch (message.method) {
    case "getRouterRtpCapabilities":
      let messageToSend = {
        method: message.method,
        router: {
          rtpCapabilities: room.getRouterRtpCapabilities()
        },
        roomid: message.roomid,
        peerid: message.peerid
      }
      return context.send(JSON.stringify(messageToSend));
    case "createWebRtcTransport":
      type = null;
      try {
        if (message.data.producing) {
          type = "producing";
        }
        if (message.data.consuming) {
          type = "consuming";
        }
        let transport = await room.createWebRtcTransport(peer, message);
        peer.send(this, "createWebRtcTransport", {
          type: type,
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
          sctpParameters: transport.sctpParameters
        });
      } catch (e) {
        this.log(e, "ERROR");
        peer.send(this, "createWebRtcTransport", {
          type: type,
          error: e
        });
      }
      break;
    case "join":
      let peerInfos = await room.join(peer, message);
      peer.send(room, "join", {
        peers: peerInfos
      });
      break;
    case "connectWebRtcTransport":
      try {
        let res = await room.connecWebRtcTransport(peer, message.data);
        peer.send(room, "connectWebRtcTransport", {
          type:message.data.type,
          data: res
        });
      } catch (e) {
        this.log(e, "ERROR");
        peer.send(room, "connectWebRtcTransport", {
          error: e
        });
      }
      break;
    case "produce":
      try {
        let producer = await room.createProducer(peer, message.data);
        peer.send(room, "produce", {
          id: producer.id
        });
      } catch (e) {
        this.log(e, "ERROR");
        peer.send(room, "produce", {
          error: e
        });
      }
      /*
      // Optimization: Create a server-side Consumer for each Peer.
  			for (const otherPeer of this._getJoinedPeers({ excludePeer: peer }))
  			{
  				this._createConsumer(
  					{
  						consumerPeer : otherPeer,
  						producerPeer : peer,
  						producer
  					});
  			}

  			// Add into the audioLevelObserver.
  			if (producer.kind === 'audio')
  			{
  				this._audioLevelObserver.addProducer({ producerId: producer.id })
  					.catch(() => {});
  			}
      */

      break;
    case "restartIce":
    case "closeProducer":
    case "pauseProducer":
    case "resumeProducer":
    case "pauseConsumer":
    case "resumeConsumer":
    case "setConsumerPreferredLayers":
    case "setConsumerPriority":
    case "requestConsumerKeyFrame":
    case "produceData":
    case "changeDisplayName":
    case "getTransportStats":
    case "getProducerStats":
    case "getConsumerStats":
    case "getDataProducerStats":
    case "getDataConsumerStats":
      console.log(`Event ${message.method}`);
      break;
    default:
      throw new Error("bad message");
    }
    return;
  }

  closeRoom(roomId) {
    if (this.hasRoom(roomId)) {
      this.getRoom(roomId).close();
      this.fire("roomClosed", roomid, room, this);
    }
    throw new nodefony.Error(`Room : ${roomId} not found`);
  }

  hasRoom(roomId) {
    return this.rooms.has(roomId)
  }

  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId)
  }

  setRoom(roomid, room) {
    this.rooms.set(roomid, room);
    room.on('close', () => this.rooms.delete(roomid));
  }

};

module.exports = Rooms;
