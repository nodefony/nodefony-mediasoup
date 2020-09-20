const {
  Worker,
  isMainThread,
  parentPort,
  MessagePort,
  MessageChannel,
  workerData
} = require('worker_threads');

class Recorder extends nodefony.Service {

  constructor(container) {
    super("recorder", container);
    this.workers = new Map();
    this.location = path.resolve(this.bundle.path, "recorded");
    if (!kernel.ready) {
      this.kernel.once("onReady", () => {
        this.roomsService = this.get("Rooms");
        this.peersService = this.get("Peers");
        this.kernel.on("onTerminate", async () => {
          for (let worker of this.workers) {
            this.log(`Terminate Worker ${worker[0]}`);
            await worker[1].terminate();
          }
        });
      });
    } else {
      this.roomsService = this.get("Rooms");
      this.peersService = this.get("Peers");
    }
  }

  async startRecord(roomId, peerid, location = this.location, recorder = "ffmpeg") {
    let worker = null;
    try {
      const room = this.roomsService.getRoom(roomId);
      if (!room) {
        throw new Error(`Room : ${roomId} not found`);
      }
      let peer = room.getPeer(peerid);
      if (!peer) {
        peer = room.getBroadcaster(peerid);
        if( ! peer ){
          throw new Error(`Room : ${roomId}  Peer : ${peerid} not found`);
        }
      }
      const worker = await this.createWorker(recorder);
      let recordInfo = {};
      let consumers = [];
      for (const producer of peer.producers) {
        try {
          let res = await room.publishProducerRtpStream(peer, producer[1]);
          recordInfo[producer[1].kind] = res.infos;
          consumers.push(res.rtpConsumer)
        } catch (e) {
          this.log(e, "ERROR");
          throw e
        }
        this.log(`Producer ${producer[1].kind} id : ${producer[1].id}`);
      }
      recordInfo.fileName = `${Date.now().toString()}-${peer.id}-${room.id}`;
      recordInfo.location = this.location;
      worker.postMessage({
        action: "record",
        recordInfo,
        roomId,
        peerid,
        location
      });
      setTimeout(async () => {
        for (const consumer of consumers) {
          this.log(`Resume mediasoup RTP consumer, kind: ${consumer.kind}, type: ${consumer.type}`);
          await consumer.resume();
        }
      }, 2000);
      return worker;
    } catch (e) {
      this.log(e, "ERROR");
      if (worker) {
        this.workers.delete(worker.threadId);
      }
      throw e;
    }
  }

  async stopRecord(workerId) {
    let worker = this.workers.get(workerId);
    worker.postMessage({
      action: "stopRecord",
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
          recorder = path.resolve(this.bundle.path, "src", "workers", "recoder", "ffmpeg.js");
          break;
        case "gstreamer":
        case "GStreamer":
          recorder = path.resolve(this.bundle.path, "src", "workers", "recoder", "gstreamer.js");
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
module.exports = Recorder;
