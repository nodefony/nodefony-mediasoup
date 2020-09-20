const nodefony = require("nodefony");
const { spawn } = require('child_process');
const {
  Readable
} = require('stream');
const {
  Worker,
  isMainThread,
  parentPort,
  MessagePort,
  workerData
} = require('worker_threads');

class BaseStreamer extends nodefony.Service {
  constructor(name) {
    super(name);
    this.execCmd = this.getCommand();
    this.listenSyslog();
    this.pid = process.pid;
    this.workerData = workerData;
    this.process = null;
    this.stream = null;
    this.closed = false;
    parentPort.postMessage(`running worker ${this.workerData.process} pid : ${this.pid}`);
  }

}

module.exports = BaseStreamer;
