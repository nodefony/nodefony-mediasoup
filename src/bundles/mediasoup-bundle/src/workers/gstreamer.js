const path = require("path");
const BaseRecord = require(path.resolve(__dirname, "BaseRecord.js"))

const GSTREAMER_DEBUG_LEVEL = process.env.GSTREAMER_DEBUG_LEVEL || 3;
const GSTREAMER_COMMAND = 'gst-launch-1.0';
const GSTREAMER_OPTIONS = '-v -e';


class GStreamer extends BaseRecord {
  constructor() {
    super("GStreamer");
  }

  getCommand(){
    return `GST_DEBUG=${GSTREAMER_DEBUG_LEVEL} ${GSTREAMER_COMMAND} ${GSTREAMER_OPTIONS}`;
  }

  // Build the gstreamer child process args
  get commandArgs () {
    let commandArgs = [
      `rtpbin name=rtpbin latency=50 buffer-mode=0 sdes="application/x-rtp-source-sdes, cname=(string)${this.rtpParameters.video.rtpParameters.rtcp.cname}"`,
      '!'
    ];
    commandArgs = commandArgs.concat(this.videoArgs);
    commandArgs = commandArgs.concat(this.audioArgs);
    commandArgs = commandArgs.concat(this.sinkArgs);
    //commandArgs = commandArgs.concat(this.rtcpArgs);
    //console.log(JSON.stringify(commandArgs, null , " "))
    return commandArgs;
  }

  get videoArgs () {
    const { video } = this.rtpParameters;
    const VIDEO_CAPS = `application/x-rtp,media=(string)video,clock-rate=(int)${this.videoCodecInfo.clockRate},payload=(int)${this.videoCodecInfo.payloadType},encoding-name=(string)${this.videoCodecInfo.codecName.toUpperCase()},ssrc=(uint)${video.rtpParameters.encodings[0].ssrc}`;
    return [
      `udpsrc port=${video.remoteRtpPort} caps="${VIDEO_CAPS}"`,
      '!',
      'rtpbin.recv_rtp_sink_0 rtpbin.',
      '!',
      'queue',
      '!',
      'rtpvp8depay',
      '!',
      'mux.'
    ];
  }

  get audioArgs() {
    const { audio } = this.rtpParameters;
    const AUDIO_CAPS = `application/x-rtp,media=(string)audio,clock-rate=(int)${this.audioCodecInfo.clockRate},payload=(int)${this.audioCodecInfo.payloadType},encoding-name=(string)${this.audioCodecInfo.codecName.toUpperCase()},ssrc=(uint)${audio.rtpParameters.encodings[0].ssrc}`;
    return [
      `udpsrc port=${audio.remoteRtpPort} caps="${AUDIO_CAPS}"`,
      '!',
      'rtpbin.recv_rtp_sink_1 rtpbin.',
      '!',
      'queue',
      '!',
      'rtpopusdepay',
      '!',
      'opusdec',
      '!',
      'opusenc',
      '!',
      'mux.'
    ];
  }

  get rtcpArgs () {
    const { video, audio } = this.rtpParameters;
    return [
      `udpsrc address=127.0.0.1 port=${video.remoteRtcpPort}`,
      '!',
      'rtpbin.recv_rtcp_sink_0 rtpbin.send_rtcp_src_0',
      '!',
      `udpsink host=127.0.0.1 port=${video.localRtcpPort} bind-address=127.0.0.1 bind-port=${video.remoteRtcpPort} sync=false async=false`,
      `udpsrc address=127.0.0.1 port=${audio.remoteRtcpPort}`,
      '!',
      'rtpbin.recv_rtcp_sink_1 rtpbin.send_rtcp_src_1',
      '!',
      `udpsink host=127.0.0.1 port=${audio.localRtcpPort} bind-address=127.0.0.1 bind-port=${audio.remoteRtcpPort} sync=false async=false`
    ];
  }

  get sinkArgs () {
    return [
      'webmmux name=mux',
      '!',
      `filesink location=${this.location}/${this.rtpParameters.fileName}.webm`
    ];
  }
}

module.exports = new GStreamer();
