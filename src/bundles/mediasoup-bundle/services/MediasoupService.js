const mediasoup = require('mediasoup');

module.exports = class Mediasoup extends nodefony.Service {

  constructor(container, kernelSettings, env) {
    super("mediasoup", container);
    this.kernelSettings = kernelSettings;
    this.processEnv = env;
    this.config = this.bundle.settings.mediasoup;
    this.workers = [];
    this.nextMediasoupWorkerIdx = 0;
    this.MIN_PORT = 20000;
    this.MAX_PORT = 30000;
    this.TIMEOUT = 400;
    this.orm = this.kernel.getORM();
    this.takenPortSet = new Set();
    this.gcInterval = null;
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.meetingsService = this.get("Meetings");
        this.roomsService = this.get("Rooms");
        this.peersService = this.get("Peers");
        this.entity = this.orm.getEntity("room");
        this.runMediasoupWorkers();
        if (this.config.gcIntervalTime) {
          this.roomGC();
        }
      });
      this.kernel.once("onTerminate", () => {
        this.closeWorkers();
        if (this.gcInterval) {
          clearInterval(this.gcInterval);
        }
      });
    } else {
      this.meetingsService = this.get("Meetings");
      this.roomsService = this.get("Rooms");
      this.peersService = this.get("Peers");
      this.entity = this.orm.getEntity("room");
    }
  }

  // websocket  home
  async handShake(query, context) {
    if (query.roomId) {
      let peer = null;
      let room = null;
      let mdroom = null;

      let info = `Waiting connection :
      [roomId:${query.roomId}, address:${context.remoteAddress}, origin:${context.origin}]`;
      this.log(info, "DEBUG");
      try {
        if (!query.roomId) {
          context.close("1006", "closed no roomId ");
        }
        if (!query.peerId) {
          context.close("1006", "closed no peerId ");
        }
        // get mediasoup room
        mdroom = await this.getOrCreateRoom(query.roomId);
        if (!mdroom) {
          context.close("1006", "closed can't create room");
        }
        // peer
        try {
          peer = await mdroom.createPeer(query.peerId, context);
        } catch (e) {
          this.log(e, "WARNING");
          throw new nodefony.Error(e, 5006);
        }
        if (!peer) {
          context.close("1006", "closed can't create peer");
        }
        // events room
        // close
        const close = () => {
          setTimeout(() => {
            context.close("1008", "Room Close try reconnect");
          }, 1000);
        }
        mdroom.once("close", close);
        // ACCESS
        // get administrators
        room = await this.roomsService.getUserRoom(query.roomId);

        let administrators = room.users;

        if (room.waitingconnect && administrators.length === 0) {
          setTimeout(() => {
            context.close("1008", "Room managers not found");
          }, 1000);
          return;
        }

        // EVENTS
        const sendWaitingMessage = (event, message = null, obj = {}) => {
          const sendMessage = nodefony.extend({
            method: "waiting",
            event: event,
            peers: mdroom.getPeers(),
            administrators: administrators,
            room: room,
            to: query.peerId,
            message: message
          }, obj);
          return context.send(JSON.stringify(sendMessage));
        }
        // event peer join
        const newPeer = (peer) => {
          return sendWaitingMessage("join", `peer ${peer.id} joined room`);
        };
        mdroom.on("join", newPeer);

        // event peer enter
        const peerEnter = (peer) => {
          return sendWaitingMessage("peerEnter", `peer ${peer.id} enter room  status : ${peer.status}`);
        };
        mdroom.on("peerEnter", peerEnter);

        // authorise
        const authorise = (peer) => {
          let obj = {}
          if (peer.id === query.peerId) {
            obj.authorise = true;
          }
          return sendWaitingMessage("authorise", `peer ${peer.id} accepted`, obj);
        }
        mdroom.on("authorise", authorise);

        // unauthorise
        const unauthorise = (peer) => {
          let obj = {}
          if (peer.id === query.peerId) {
            obj.authorise = false;
          }
          return sendWaitingMessage("unauthorise", `peer ${peer.id} refused`, obj);
        }
        mdroom.on("unauthorise", unauthorise);

        const peerQuit = (peer) => {
          return sendWaitingMessage("peerQuit", `peer ${peer.id} Quit `);
        }
        mdroom.on("peerQuit", peerQuit);

        const producerResume = (producer) => {
          return sendWaitingMessage("producerresume");
        };
        mdroom.on("producerresume", producerResume);

        const producerPause = (producer) => {
          return sendWaitingMessage("producerpause");
        };
        mdroom.on("producerpause", producerResume);

        const producerClose = (producer) => {
          return sendWaitingMessage("producerclose");
        };
        mdroom.on("producerclose", producerClose);

        const producerCreate = (producer) => {
          return sendWaitingMessage("producerCreate");
        };
        mdroom.on("producercreate", producerCreate);

        // socket
        context.once('onClose', () => {
          //clean mediasoup events
          mdroom.removeListener("join", newPeer);
          mdroom.removeListener("close", close);
          mdroom.removeListener("peerQuit", peerQuit);
          mdroom.removeListener("peerEnter", peerEnter);
          mdroom.removeListener("unauthorise", unauthorise);
          mdroom.removeListener("authorise", authorise);
          mdroom.removeListener("producerpause", producerResume);
          mdroom.removeListener("producerresume", producerResume);
          mdroom.removeListener("producerclose", producerClose);
          mdroom.removeListener("producerCreate", producerCreate);
        });

        let message = null;
        let status = null;
        if (room.waitingconnect) {
          message = `Waiting Authorisation`;
          status = "waiting";
        } else {
          message = "Authorised"
          status = "authorised";
        }
        // is administrator
        //let admin = null;
        administrators.filter((user) => {
          if (user.username === query.peerId) {
            //admin = user;
            status = "authorised";
            peer.status = "authorised";
            return user
          }
        });

        let sendMessage = {
          method: "waiting",
          status: status,
          peers: mdroom.getPeers(),
          room: room,
          to: query.peerId,
          administrators: administrators,
          message: message
        };
        return context.send(JSON.stringify(sendMessage));
      } catch (e) {
        if (peer) {
          peer.status = "disconnected";
        }
        this.log(e, "ERROR")
        context.close("1008", e.message || "Room can't be create");
        throw e;
      }
    } else {
      throw new nodefony.Error("Connection request without roomId", 5006);
    }
  }

  handle(message, context) {
    this.log(message, "DEBUG");
    if (!message.roomid && !message.peerid) {
      throw new Error(`Message  roomid an/or peerid not defined`);
    }
    let room = this.meetingsService.getRoom(message.roomid);
    if (!room) {
      throw new Error(`Room not exit with id ${message.roomid} `);
    }
    let peer = room.getPeer(message.peerid);
    if (!peer) {
      throw new Error(`Peer not exit with id ${message.peerid} `);
    }
    return this.meetingsService.handle(room, peer, message, context);
  }

  async runMediasoupWorkers() {
    const {
      numWorkers
    } = this.config;
    this.log(`running ${numWorkers} mediasoup Workers...`);

    for (let i = 0; i < numWorkers; ++i) {
      const worker = await mediasoup.createWorker({
        logLevel: this.config.workerSettings.logLevel,
        logTags: this.config.workerSettings.logTags,
        rtcMinPort: Number(this.config.workerSettings.rtcMinPort),
        rtcMaxPort: Number(this.config.workerSettings.rtcMaxPort)
      });
      worker.on('died', (error) => {
        this.log(`mediasoup Worker died, [pid:${worker.pid}]`);
        this.log(error, "ERROR");
      });
      worker.observer.on('close', () => {
        this.log(`mediasoup Worker close, exiting ... [pid:${worker.pid}]`);
      });
      worker.observer.on("newrouter", (router) => {
        this.log(`new router created [id:${router.id}]`);
      });
      this.workers.push(worker);
      this.log(`run [pid:${worker.pid}] mediasoup Worker...`);
      // Log worker resource usage every X seconds.
      if (this.kernel.debug) {
        /*setInterval(async () => {
          const usage = await worker.getResourceUsage();
          this.log(`mediasoup Worker resource usage [pid:${worker.pid}]:`, "DEBUG");
          this.log(usage);
        }, 60 * 1000);*/
      }
    }
  }

  getMediasoupWorker() {
    const worker = this.workers[this.nextMediasoupWorkerIdx];
    if (++this.nextMediasoupWorkerIdx === this.workers.length) {
      this.nextMediasoupWorkerIdx = 0;
    }
    return worker;
  }

  async getOrCreateRoom(
    roomId
  ) {
    let room = this.meetingsService.getRoom(roomId);
    // If the Room does not exist create a new one.
    if (!room) {
      this.log(`creating a new Room [roomId:${roomId}]`);
      const worker = this.getMediasoupWorker();
      room = await this.meetingsService.create(
        worker,
        roomId
      );
    } else {
      this.log(`Connect Room  [roomId:${roomId}]`);
    }
    return room;
  }

  closeWorkers() {
    for (let i = 0; i < this.workers.length; ++i) {
      //this.log(`mediasoup Worker close, exiting ... [pid:${this.workers[i].pid}]`);
      this.workers[i].close();
    }
  }

  // ports management
  // TODO:
  async getPort() {
    let port = this.getRandomPort();
    while (this.takenPortSet.has(port)) {
      port = this.getRandomPort();
      try {
        // Check that the port is available to use
        await this.isPortOpen(port);
      } catch (error) {
        console.error('getPort() port is taken [port:%d]', port);
        this.takenPortSet.add(port);
      }
    }
    this.takenPortSet.add(port);
    return port;
  }

  releasePort(port) {
    this.takenPortSet.delete(port);
  }

  getRandomPort() {
    return Math.floor(Math.random() * (this.MAX_PORT - this.MIN_PORT + 1) + this.MIN_PORT)
  }

  isPortOpen(port, ip = "127.0.0.1") {
    return new Promise((resolve, reject) => {
      socket.once('connect', () => resolve);
      socket.setTimeout(this.TIMEOUT);
      socket.once('timeout', () => reject);
      socket.once('error', (error) => reject());
      socket.connect(port, ip);
    });
  }

  // ROOM GARBAGE
  roomGC() {
    this.log(`Initiliaze Interval ${this.config.gcIntervalTime } ms`, "INFO", "MEDIASOUP GARBAGE COLLECTOR");
    this.gcInterval = setInterval(() => {
      this.meetingsService.rooms.forEach(async (room, key, map) => {
        this.log(`GARBAGE COLLECTOR Check room isActive  :${key}`, "DEBUG", "MEDIASOUP GARBAGE COLLECTOR");
        if (room.peers.size) {
          return;
        }
        await this.meetingsService.closeRoom(room.id)
        this.log(`Close room :${room.id}`, "INFO", "MEDIASOUP GARBAGE COLLECTOR");
      });
    }, this.config.gcIntervalTime);
  }
};
