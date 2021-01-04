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
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.meetingsService = this.get("Meetings");
        this.peersService = this.get("Peers");
        this.entity = this.orm.getEntity("room");
        this.runMediasoupWorkers();
      });
      this.kernel.once("onTerminate", () => {
        this.closeWorkers();
      });
    } else {
      this.meetingsService = this.get("Meetings");
      this.peersService = this.get("Peers");
      this.entity = this.orm.getEntity("room");
    }
  }

  async handShake(query, context) {
    if (query.roomId && query.peerId) {
      let info = `websocket handshake connection :
      [roomId:${query.roomId}, peerId:${query.peerId}, address:${context.remoteAddress}, origin:${context.origin}]`;
      this.log(info);
      let mdroom = await this.getOrCreateRoom(query.roomId);
      let peer = await mdroom.createPeer(query.peerId, context);
      let message = {
        query,
        method: "handshake",
        roomid: mdroom.id,
        peerid: peer.id
      };
      return context.send(JSON.stringify(message));
    } else {
      throw new nodefony.Error("Connection request without roomId and/or peerId", 5006);
    }
  }

  handle(message, context) {
    this.log(message);
    if (!message.roomid && !message.peerid) {
      throw new Error(`Message can be without roomid an/or peerid`);
    }
    /*if (!this.meetingsService.hasRoom(message.roomid)) {
      if (message.method !== "join") {
        throw new Error(`No room : ${message.roomid} found `);
      }
    }*/
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

};
