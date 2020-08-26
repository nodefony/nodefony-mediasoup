const mediasoup = require('mediasoup');

module.exports = class Mediasoup extends nodefony.Service {

  constructor(container, kernelSettings, env) {
    super("mediasoup", container);
    this.kernelSettings = kernelSettings;
    this.processEnv = env;
    this.config = this.bundle.settings.mediasoup;
    this.workers = [];
    this.nextMediasoupWorkerIdx = 0;
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.roomsService = this.get("Rooms");
        this.peersService = this.get("Peers");
        this.runMediasoupWorkers();
      });
      this.kernel.once("onTerminate", () => {
        this.closeWorkers();
      });
    } else {
      this.roomsService = this.get("Rooms");
      this.peersService = this.get("Peers");
    }
  }

  async handShake(query, context) {
    if (query.roomId && query.peerId) {
      let info = `websocket handshake connection :
      [roomId:${query.roomId}, peerId:${query.peerId}, address:${context.remoteAddress}, origin:${context.origin}]`;
      this.log(info);
      let room = await this.getOrCreateRoom(query.roomId);
      let peer = await room.createPeer(query.peerId, context);
      let message = {
        query,
        method: "handshake",
        roomid: room.id,
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
    /*if (!this.roomsService.hasRoom(message.roomid)) {
      if (message.method !== "join") {
        throw new Error(`No room : ${message.roomid} found `);
      }
    }*/
    let room = this.roomsService.getRoom(message.roomid);
    if (!room) {
      throw new Error(`Room not exit with id ${message.roomid} `);
    }
    let peer = room.getPeer(message.peerid);
    if (!peer) {
      throw new Error(`Peer not exit with id ${message.peerid} `);
    }
    return this.roomsService.handle(room, peer, message, context);
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
        setInterval(async () => {
          const usage = await worker.getResourceUsage();
          this.log(`mediasoup Worker resource usage [pid:${worker.pid}]:`, "DEBUG");
          this.log(usage);
        }, 120000);
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
    let room = this.roomsService.getRoom(roomId);
    // If the Room does not exist create a new one.
    if (!room) {
      this.log(`creating a new Room [roomId:${roomId}]`);
      const worker = this.getMediasoupWorker();
      room = await this.roomsService.create(
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
};
