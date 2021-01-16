const {
  Worker,
  isMainThread,
  parentPort,
  MessagePort,
  MessageChannel,
  workerData
} = require('worker_threads');

class Streamer extends nodefony.Service {

  constructor(container) {
    super("streamer", container);
    this.workers = new Map();
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.meetingsService = this.get("Meetings");
        this.peersService = this.get("Peers");
        this.kernel.on("onTerminate", async () => {
          for (let worker of this.workers) {
            this.log(`Terminate Worker ${worker[0]}`);
            await worker[1].terminate();
          }
        });
      });
    } else {
      this.meetingsService = this.get("Meetings");
      this.peersService = this.get("Peers");
    }
  }

  async startStream(roomId, file, streamer = "ffmpeg") {
    let worker = null;
    try {
      const room = this.meetingsService.getRoom(roomId);
      if (!room) {
        throw new Error(`Room : ${roomId} not found`);
      }
      const worker = await this.createWorker(streamer);
      let streamInfo = {file};
      //>>> creating Broadcaster...
      const broadcaster = await room.createBroadcaster(
        "111111",
        "eee",
        device,
        rtpCapabilities
      );

      //>>> creating mediasoup PlainTransport for producing audio...

      //>>> creating mediasoup PlainTransport for producing video...

      //>>> creating mediasoup audio Producer...
      //>>> creating mediasoup video Producer...

      //>>> running worker ...
      worker.postMessage({
        action: "stream",
        streamInfo,
        roomId
      });
      return worker;
    } catch (e) {
      this.log(e, "ERROR");
      if (worker) {
        this.workers.delete(worker.threadId);
      }
      throw e;
    }
  }

  async stopStream(workerId) {
    let worker = this.workers.get(workerId);
    worker.postMessage({
      action: "stopStream",
      workerId: workerId
    });
  }

  createWorker(name) {
    return new Promise(async (resolve, reject) => {
      try {
        let recorder = null;
        switch (name) {
        case "ffmpeg":
        case "FFmpeg":
          recorder = path.resolve(this.bundle.path, "src", "workers", "streamer", "ffmpeg.js");
          break;
        case "gstreamer":
        case "GStreamer":
          recorder = path.resolve(this.bundle.path, "src", "workers", "streamer", "gstreamer.js");
          break;
        }
        const worker = new Worker(recorder, {
          workerData: {
            process: name
          }
        });
        worker.on('online', () => {
          this.log(`Worker online !`, "INFO", );
          this.fire("online", worker);
          return resolve(worker);
        });

        worker.on('message', (message) => {
          this.fire("message", worker, message);
          this.log(message, "DEBUG");
        });

        worker.on('error', (e) => {
          //this.fire("error", worker, e);
          this.log(e, "ERROR");
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            throw new Error(`Worker stopped with exit code ${code}`);
          }
          this.log(code);
          this.workers.delete(worker.threadId);
          this.fire("exit", worker, code);
        });
        this.workers.set(worker.threadId, worker);
        return worker;
      } catch (e) {
        this.log(e, "ERROR");
        if (worker) {
          this.fire("error", worker, e);
          if (this.workers.has(worker.threadId)) {
            this.workers.delete(worker.threadId);
            await worker.terminate();
          }
        }
        return reject(e);
      }
    });
  }
}
module.exports = Streamer;
