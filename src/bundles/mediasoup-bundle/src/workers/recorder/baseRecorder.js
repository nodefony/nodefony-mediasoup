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

class BaseRecorder extends nodefony.Service {
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
    parentPort.on('message', async (message) => {
      switch (message.action) {
      case "record":
        {
          try {
            this.process = await this.record(message.recordInfo, message.location);
            return parentPort.postMessage({
              action: "startRecord",
              pid: this.pid
            });
          } catch (error) {
            this.log(error, "ERROR");
            this.killProcess();
            return parentPort.postMessage({
              action: "startRecord",
              error,
              pid: this.pid
            });
          }
          break;
        }
      case "stopRecord":
        {
          try {
            let res = this.killProcess();
            return parentPort.postMessage({
              action: "stopRecord",
              pid: this.pid
            });
          } catch (error) {
            return parentPort.postMessage({
              action: "stopRecord",
              error,
              pid: this.pid
            });
          }
        }
      }
    });
  }

  record(rtpParameters = null, location) {
    return new Promise(async (resolve, reject) => {
      try {
        this.location = location ;
        this.rtpParameters = rtpParameters ;
        // Video codec info
        this.videoCodecInfo = this.getCodecInfoFromRtpParameters('video',this.rtpParameters.video.rtpParameters);

        // Audio codec info
        this.audioCodecInfo = this.getCodecInfoFromRtpParameters('audio', this.rtpParameters.audio.rtpParameters);

        this.sdpString = this.createSdpText();
        this.stream = this.convertStringToStream();

        const process = await this.spawn(this.execCmd, this.commandArgs);
        parentPort.postMessage({
          action: "startRecord",
          message: `running ${this.name} pid : ${process.pid}`,
          pid: this.pid
        });
        // Pipe sdp stream to process
        try {
          this.stream.resume();
          this.stream.pipe(process.stdin);
        } catch (e) {
          this.log(e, "ERROR")
          return reject(e);
        }
        return resolve(process);
      } catch (e) {
        this.log(e, "ERROR");
        return reject(e);
      }
    });
  }

  killProcess() {
    try {
      if (!this.process) {
        throw new Error(`No process found`);
      }
      if (this.closed) {
        throw new Error(`Process ${this.pid} already closed`);
      }
      this.log(`kill(SIGINT) [pid:${process.pid}]`);
      this.process.kill('SIGINT');
      this.process = null;
      return parentPort.postMessage({
        action: "killProcess",
        pid: this.pid
      });
    } catch (e) {
      this.log(e, "ERROR");
      throw e;
    }
  }

  getCodecInfoFromRtpParameters(kind, rtpParameters) {
    return {
      payloadType: rtpParameters.codecs[0].payloadType,
      codecName: rtpParameters.codecs[0].mimeType.replace(`${kind}/`, ''),
      clockRate: rtpParameters.codecs[0].clockRate,
      channels: kind === 'audio' ? rtpParameters.codecs[0].channels : undefined
    };
  }

  createSdpText() {
    const {
      video,
      audio
    } = this.rtpParameters;
    return `v=0
    o=- 0 0 IN IP4 127.0.0.1
    s=${this.rtpParameters.fileName}
    c=IN IP4 127.0.0.1
    t=0 0
    m=video ${video.remoteRtpPort} RTP/AVP ${this.videoCodecInfo.payloadType}
    a=rtpmap:${this.videoCodecInfo.payloadType} ${this.videoCodecInfo.codecName}/${this.videoCodecInfo.clockRate}
    a=sendonly
    m=audio ${audio.remoteRtpPort} RTP/AVP ${this.audioCodecInfo.payloadType}
    a=rtpmap:${this.audioCodecInfo.payloadType} ${this.audioCodecInfo.codecName}/${this.audioCodecInfo.clockRate}/${this.audioCodecInfo.channels}
    a=sendonly`;
  }

  convertStringToStream() {
    const stream = new Readable();
    stream.on('error', error => {
      this.log(error, "ERROR", "Readable spd stream");
    });
    stream._read = () => {};
    stream.push(this.sdpString);
    stream.push(null);
    return stream;
  }

  spawn(command = this.workerData.process, args, options = {}) {
    return new Promise((resolve, reject) => {
      let cmd = null;
      try {
        this.log(`Spawn : ${command} ${args.join(" ")}`, "INFO");
        let opt = nodefony.extend( {
          cwd: process.cwd(),
          env: process.env,
          detached: false,
          shell: true,
          stdio: ['pipe', 'inherit', 'inherit']
        }, options);
        cmd = spawn(command, args, opt);
        // GStreamer/FFmpeg writes some initial logs to stdout
        if (cmd.stdout) {
          cmd.stdout.setEncoding('utf-8');
          cmd.stdout.on('data', (data) => {
            let str = data.toString();
            if (str) {
              process.stdout.write(str);
              //this.log(str);
            }
          });
        }
        // GStreamer/FFmpeg writes its progress logs to stderr
        if (cmd.stderr) {
          cmd.stderr.setEncoding('utf-8');
          cmd.stderr.on('data', (data) => {
            let str = data.toString();
            if (str) {
              process.stdout.write(str);
              //this.log(str);
            }
          });
        }
        cmd.on('message', message => {
          this.log(str, "INFO", "Spawn Message");
        });
        cmd.once('close', (code) => {
          this.closed = true;
          parentPort.postMessage({
            action: "event",
            event: "close",
            code: code,
            pid: this.pid
          });
          this.log(`Spawn : ${command} ${args.join(" ")} Error Code : ${code}`, "WARNING");
        });
        cmd.on('error', (error) => {
          parentPort.postMessage({
            action: "event",
            event: "error",
            error,
            pid: this.pid
          });
          this.log(error, "ERROR");
          throw error;
        });
        return resolve(cmd);
      } catch (error) {
        parentPort.postMessage({
          action: "startRecord",
          error,
          pid: this.pid
        });
        this.log(error, "ERROR");
        return reject(error);
      }
    });
  }
}

module.exports = BaseRecorder;
