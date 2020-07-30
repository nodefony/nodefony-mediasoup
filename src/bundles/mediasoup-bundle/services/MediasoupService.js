const mediasoup = require('mediasoup');

module.exports = class Mediasoup extends nodefony.Service {

  constructor(container, kernelSettings, env) {
    super("mediasoup", container);
    this.kernelSettings = kernelSettings;
    this.processEnv = env;
    this.config = this.bundle.settings.mediasoup;
    this.workers = [];
    this.nextMediasoupWorkerIdx = 0;
    console.log("passsssssss")
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.roomsService = this.get("rooms");
        this.runMediasoupWorkers();
      });
      this.kernel.once("onTerminate", () => {
        this.closeWorkers()
      });
      /*setTimeout(() => {
        this.closeWorkers()
      }, 20000);*/
    }else{
      this.roomsService = this.get("rooms");
    }
  }

  async handShakeRealTime(query, context){
    if ( query.roomId && query.peerId){
      let info = `websocket connection request :
      [roomId:${query.roomId}, peerId:${query.peerId}, address:${context.remoteAddress}, origin:${context.origin}]`
      this.log(info);
      let room = await this.getOrCreateRoom(query.roomId, query.peerId);
      context.send("ssss")
    }else{
      throw new nodefony.Error("Connection request without roomId and/or peerId", 5006)
    }
  }

  handleMessageRealTime(message, context){
    console.log(message)
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
      setInterval(async () => {
        const usage = await worker.getResourceUsage();
        this.log(`mediasoup Worker resource usage [pid:${worker.pid}]:`);
        this.log(usage);
      }, 120000);
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
      const mediasoupWorker = this.getMediasoupWorker();
      room = await this.roomsService.create(
        mediasoupWorker,
        roomId
      );
      this.roomsService.setRoom(roomId, room);
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
