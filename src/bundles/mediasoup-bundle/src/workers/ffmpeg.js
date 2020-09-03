const path = require("path");
const BaseRecord = require(path.resolve(__dirname, "BaseRecord.js"));

const FFMPEG_COMMAND = 'ffmpeg';


class FFmpeg extends BaseRecord {
  constructor() {
    super("FFmpeg");
  }

  getCommand(){
    return `${FFMPEG_COMMAND}`;
  }

  get videoArgs() {
    return [
      '-map',
      '0:v:0',
      '-c:v',
      'copy'
    ];
  }

  get audioArgs() {
    return [
      '-map',
      '0:a:0',
      '-strict', // libvorbis is experimental
      '-2',
      '-c:a',
      'copy'
    ];
  }

  get commandArgs() {
    let commandArgs = [
      '-loglevel',
      'debug',
      '-protocol_whitelist',
      'pipe,udp,rtp',
      '-fflags',
      '+genpts',
      '-f',
      'sdp',
      '-i',
      'pipe:0'
    ];
    commandArgs = commandArgs.concat(this.videoArgs);
    commandArgs = commandArgs.concat(this.audioArgs);
    commandArgs = commandArgs.concat([
      '-flags',
      '+global_header',
      `${this.location}/${this.rtpParameters.fileName}.webm`
    ]);
    return commandArgs;
  }
}

module.exports = new FFmpeg();
