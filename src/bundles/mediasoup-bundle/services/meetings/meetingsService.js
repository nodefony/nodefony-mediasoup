const Room = require(path.resolve(__dirname, "..", "..", "src", "room.js"))

class Meetings extends nodefony.Service {

  constructor(container) {
    super("Meetings", container);
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
  }

  create(worker, roomid, mediaCodecs = this.mediaRouterOptions.mediaCodecs) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a mediasoup Router.
        this.log({
          mediaCodecs
        });
        const router = await worker.createRouter({
          mediaCodecs
        });
        // bot data
        const bot = await this.botService.create("globalChat", router);
        const room = new Room(roomid, worker, router, bot, this.container);
        this.setRoom(room.id, room);
        router.once("workerclose", async () => {
          return await this.closeRoom(roomid);
        });
        room.once("close", () => {
          this.deleteRoom(room.id);
        });
        return resolve(room);
      } catch (e) {
        return reject(e);
      }
    });
  }

  async handle(room, peer, message, context) {
    //let transport = null;
    //let transportId = null;
    let type = null;
    //let producerId = null;
    //let consumerId = null;
    switch (message.method) {
    case "getRouterRtpCapabilities":
      {
        let messageToSend = {
          method: message.method,
          router: {
            rtpCapabilities: room.getRouterRtpCapabilities()
          },
          roomid: message.roomid,
          peerid: message.peerid
        };
        return context.send(JSON.stringify(messageToSend));
      }
    case "createWebRtcTransport":
      {
        let type = null;
        try {
          if (message.data.producing) {
            type = "producing";
          }
          if (message.data.consuming) {
            type = "consuming";
          }
          let transport = await room.createTransport("webrtc", message.data);
          transport.on('trace', (trace) => {
            this.log(`transport "trace" event [transportId:${transport.id}, trace.type:${trace.type} ]`, "DEBUG");
            this.log(trace, "DEBUG");
            peer.notify(this, 'downlinkBwe', {
              desiredBitrate: trace.info.desiredBitrate,
              effectiveDesiredBitrate: trace.info.effectiveDesiredBitrate,
              availableBitrate: trace.info.availableBitrate
            });
          });
          peer.send(this, "createWebRtcTransport", {
            type: type,
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
            sctpParameters: transport.sctpParameters
          });
          peer.setTransport(transport.id, transport);
        } catch (e) {
          this.log(e, "ERROR");
          peer.send(this, "createWebRtcTransport", {
            type: type,
            error: e
          });
        }
        break;
      }
    case "join":
      {
        let peerInfos = await room.join(peer, message);
        peer.send(room, "join", {
          peers: peerInfos
        });
        this.fire("joinPeer", room, peerInfos);
        const joinedPeers = [
					...room.getJoinedPeers(),
					...room.broadcasters.values()
				];
        for (const joinedPeer of joinedPeers) {
          // Create Consumers for existing Producers.
          for (const producer of joinedPeer.producers.values()) {
            room.createConsumer({
              consumerPeer: peer,
              producerPeer: joinedPeer,
              producer
            });
          }
          // Create DataConsumers for existing DataProducers.
          for (const dataProducer of joinedPeer.dataProducers.values()) {
            if (dataProducer.label === 'bot') {
              continue;
            }
            await room.createDataConsumer(
              peer,
              joinedPeer,
              dataProducer
            );
          }
        }
        // Create DataConsumers for bot DataProducer.
        await room.createDataConsumer(peer, null, room.bot.dataProducer);

        // Notify the new Peer to all other Peers.
        for (const otherPeer of room.getJoinedPeers({
            excludePeer: peer
          })) {
          otherPeer.notify(room, 'newPeer', {
            id: peer.id,
            displayName: peer.displayName,
            device: peer.device,
            status:peer.status
          });
        }
        break;
      }
    case "connectWebRtcTransport":
      {
        try {
          const {
            transportId,
            dtlsParameters
          } = message.data;
          const transport = peer.transports.get(transportId);
          if (!transport) {
            throw new Error(`transport with id "${transportId}" not found`);
          }
          await room.connecWebRtcTransport(transport, dtlsParameters);
          peer.send(room, "connectWebRtcTransport", {
            type: message.data.type,
            id: transport.id
          });
        } catch (e) {
          this.log(e, "ERROR");
          peer.send(room, "connectWebRtcTransport", {
            error: e
          });
        }
        break;
      }
    case "produce":
      {
        let producer = null;
        try {
          producer = await room.createProducer(peer, message.data);
          peer.send(room, "produce", {
            id: producer.id,
            ...message.data
          });
        } catch (e) {
          this.log(e, "ERROR");
          peer.send(room, "produce", {
            error: e
          });
        }
        for (const otherPeer of room.getJoinedPeers({
            excludePeer: peer
          })) {
          room.createConsumer({
            consumerPeer: otherPeer,
            producerPeer: peer,
            producer
          });
        }
        // Add into the audioLevelObserver.
        if (producer.kind === 'audio') {
          room.audioLevelObserver.addProducer({
              producerId: producer.id
            })
            .catch(() => {});
        }
        break;
      }
    case "closeProducer":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        let producerId = message.data.producerId;
        await peer.closeProducer(producerId);
        peer.send(room, "closeProducer", {
          producerId: producerId
        });
        break;
      }
    case "pauseProducer":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        let producerId = message.data.producerId;
        await peer.pauseProducer(producerId);
        peer.send(room, "pauseProducer", {
          producerId: producerId
        });
        break;
      }
    case "resumeProducer":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        let producerId = message.data.producerId;
        await peer.resumeProducer(producerId);
        peer.send(room, "resumeProducer", {
          producerId: producerId
        });
        break;
      }
    case "pauseConsumer":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        let consumerId = message.data.consumerId;
        await peer.pauseConsumer(producerId);
        peer.send(room, "pauseConsumer", {
          consumerId: consumerId
        });
        break;
      }
    case "resumeConsumer":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        let consumerId = message.data.consumerId;
        await peer.resumeConsumer(producerId);
        peer.send(room, "resumeConsumer", {
          consumerId: consumerId
        });
        break;
      }
    case "setConsumerPreferredLayers":
    case "setConsumerPriority":
    case "requestConsumerKeyFrame":
      break;
    case "produceData":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        const {
          transportId,
          sctpStreamParameters,
          label,
          protocol,
          appData
        } = message.data;
        const transport = peer.transports.get(transportId);
        if (!transport) {
          throw new Error(`transport with id "${transportId}" not found`);
        }
        const dataProducer = await transport.produceData({
          sctpStreamParameters,
          label,
          protocol,
          appData
        });
        // Store the Producer into the protoo Peer data Object.
        peer.dataProducers.set(dataProducer.id, dataProducer);
        peer.send(room, "produceData", {
          id: dataProducer.id
        });
        switch (dataProducer.label) {
        case 'chat':
          {
            // Create a server-side DataConsumer for each Peer.
            for (const otherPeer of room.getJoinedPeers({
                excludePeer: peer
              })) {
              await room.createDataConsumer(
                otherPeer,
                peer,
                dataProducer
              );
            }
            break;
          }
        case 'bot':
          {
            // Pass it to the bot.
            room.bot.handlePeerDataProducer({
              dataProducerId: dataProducer.id,
              peer
            });
            break;
          }
        }
        break;
      }
      //tools
    case "restartIce":
      {
        let transportId = message.data.transportId;
        let transport = peer.getTransport(transportId);
        if (!transport) {
          throw new Error(`transport with id "${transportId}" not found`);
        }
        const iceParameters = await transport.restartIce();
        peer.send(room, "restartIce", {
          iceParameters: iceParameters
        });
        break;
      }
    case "changeDisplayName":
      {
        // Ensure the Peer is joined.
        if (!peer.joined) {
          throw new Error('Peer not yet joined');
        }
        const {
          displayName
        } = message.data;
        const oldDisplayName = peer.displayName;
        // Store the display name
        // Peer.
        peer.displayName = displayName;
        room.notifyAllPeers("peerDisplayNameChanged", {
          peerId: peer.id,
          displayName,
          oldDisplayName
        }, {
          excludePeer: peer
        });
        break;
      }
      //stats
    case "getTransportStats":
    case "getProducerStats":
    case "getConsumerStats":
    case "getDataProducerStats":
    case "getDataConsumerStats":
      console.log(`Event ${message.method}`);
      break;
    default:
      this.log(message)
      throw new Error("bad message");
    }
  }

  async closeRoom(roomId) {
    if (this.hasRoom(roomId)) {
      let room = await this.getRoom(roomId).close();
      this.fire("roomClosed", roomid, room, this);
      this.deleteRoom(roomId);
      return room;
    }
    throw new nodefony.Error(`Room : ${roomId} not found`);
  }

  hasRoom(roomId) {
    return this.rooms.has(roomId);
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    return this.rooms.delete(roomId);
  }

  setRoom(roomid, room) {
    this.rooms.set(roomid, room);
    room.on('close', () => this.rooms.delete(roomid));
  }
}

module.exports = Meetings;
