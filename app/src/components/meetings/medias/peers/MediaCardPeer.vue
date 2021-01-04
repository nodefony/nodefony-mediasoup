<template>
<v-card :width="cardWidth" :height="height" class="rounded-lg" :elevation="elevation" :outlined="hover" :min-width="minWidth" :max-width="maxWidth" :max-height="maxHeight" :min-height="minHeight" :loading="loading" rounded @click="toggle" :class="{ focus: focus}"
  style="background:transparent;">

  <media-volume-peer v-if="volume" fab rounded absolute top left color="blue-grey" class=" white--text" :volume="this.volume || 0" :muted="local ? !hasAudio : !audio" />

  <slot name="peer"></slot>

  <v-container fluid class="pa-0">

    <!-- VIDEO -->
    <v-hover v-slot="{ hover }" :disabled="hoverDisabled">
      <v-row class="pa-0 ma-0">
        <v-container v-show="video || screen || noise" fluid class="pa-0 ma-0">

          <v-container fluid fill-height class="pa-0 ma-0">
            <v-row justify="center" align="center" class="pa-0 ma-0">
              <div v-show="hover" style="position:absolute">
                <v-avatar color="primary" class="white--text" :size="local ? (remote ? 50 : 120) :50">{{local ? getTrigramme : (remote ? remote.id : "") }}</v-avatar>
              </div>
              <video style="width:100%;border-radius:8px 8px 0 0;" class="pa-0 ma-0" muted playsinline :controls="false" ref="prevideo" />
            </v-row>
          </v-container>

        </v-container>

        <v-container v-show="(!video && !screen && !noise)" fluid class="pa-0">

          <v-container fluid fill-height style="min-height:160px;background-color:grey;opacity:0.3;border-radius:8px 8px 0 0;" class="pa-0 ma-0">
            <v-row justify="center" align="center">
              <div style="position:absolute">
                <v-avatar color="primary" class="white--text" :size="local ? (remote ? 50 : 120) :50">{{local ? getTrigramme : (remote ? remote.id : "") }}</v-avatar>
                <h1 v-if="hover" style="color:white"></h1>
              </div>
            </v-row>
          </v-container>

        </v-container>

      </v-row>
    </v-hover>
    <!-- AUDIO -->
    <audio playsinline :controls="false" style="display:none" :muted="local" ref="preaudio" />
    <!-- CANVAS -->
    <v-row v-show="spectrum && audio" class="mx-5">
      <canvas ref="canvas" style="width:100%;height:50px;opacity:0.33;" />
    </v-row>

    <slot name="options">
      <v-expand-transition>
        <v-container v-show="local && showOptions">
          <v-divider></v-divider>
          <v-subheader>Devices Settings</v-subheader>
          <v-row justify="space-between" class="mt-0">
            <v-col v-if="this.audio" class="d-flex" cols="12" sm="6">
              <v-select v-model="audioDevice" dense :items="getDevicesAudioLabels" label="Audio Devices" outlined v-on:change='changeDevice("audio")'></v-select>
            </v-col>
            <v-col v-if="this.video" class="d-flex" cols="12" sm="6">
              <v-select v-model="videoDevice" dense :items="getDevicesVideoLabels" label="Videos Devices" outlined v-on:change='changeDevice("video")'></v-select>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-subheader v-if="this.video|| this.screen || this.noise">Videos Settings</v-subheader>
          <v-row v-if="this.video|| this.screen || this.noise" justify="space-around" class="mt-0">
            <v-col class="d-flex" cols="12" sm="6">
              <v-select dense :items="this.options.videos" label="Videos" outlined v-model="resolution" @change='changeVideoFormat'>
              </v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-expand-transition>
    </slot>
  </v-container>
</v-card>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import Volume from '@/components/meetings/medias/peers/MediaVolumePeer';

export default {
  name: 'MediaCardPeer',
  components: {
    "media-volume-peer": Volume
  },
  props: {
    init: {
      type: Boolean,
      default: false
    },
    spectrum: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: true
    },
    remote: {
      type: Object,
      default: null
    },
    name: {
      type: String
    },
    width: {
      type: String
    },
    minWidth: {
      type: String,
      default: "200"
    },
    maxWidth: {
      type: String,
      default: "100%"
    },
    height: {
      type: String
    },
    minHeight: {
      type: String,
      default: "100"
    },
    maxHeight: {
      type: String,
      default: "100%"
    },
    showOptions: {
      type: Boolean,
      default: false
    }

  },
  data(vm) {
    return {
      local: false,
      message: null,
      loading: false,
      elevation: 4,
      hoverDisabled: false,
      hover: false,
      focus: false,
      resolution: "hd",
      devices: [],
      audio: null,
      video: null,
      screen: null,
      noise: null,
      level: -100,
      audioStream: null,
      videoStream: null,
      options: {
        videos: ['hd', 'vga', 'qvga'],
        constrains: vm.$mediasoup.VIDEO_CONSTRAINS
      }
    }
  },
  async mounted() {
    if (this.remote) {
      if (this.remote.local) {
        this.local = true;
      }
    } else {
      this.local = true;
    }

    if (this.remote && this.active) {
      this.log(`initialize remote stream`)
      if (this.remote.audioStream) {
        this.audioStream = this.createAudioStream(this.remote.audioStream);
        this.audioStream.mediaElement = this.$refs["preaudio"];
      } else {
        this.createAudioStream();
      }
      if (this.remote.videoStream) {
        this.videoStream = this.createVideoStream(this.remote.videoStream);
        this.videoStream.mediaElement = this.$refs["prevideo"];
      } else {
        this.createVideoStream();
      }
    } else {
      if (this.init) {
        await this.initialize();
        if (this.showOptions) {
          //this.initDevices();
        }
      } else {
        this.createAudioStream();
        this.createVideoStream();
      }
    }
  },
  beforeDestroy() {
    this.log(`Try Destroy peer component ${this.name}`, "DEBUG");
    this.stopAudioStream();
    this.stopVideoStream();
    if (this.$spectrum) {
      this.$spectrum.stop();
    }
  },
  destroyed() {
    this.log(`Destroy peer ${this.name}`)
  },

  computed: {
    volume: {
      set(value) {
        this.level = value
      },
      get() {
        return this.level;
      }
    },
    ...mapGetters([
      'getTrigramme',
      "hasAudio",
      "hasVideo",
      "hasScreen",
      "hasNoise",
      'webcam',
      'microphone',
      'webcamDevice',
      'webcamResolution',
      'videoDevices',
      'audioDevices',
      'getDevicesAudioLabels',
      'getDevicesVideoLabels',
      'getAudioDeviceByValue',
      'getVideoDeviceByValue',

    ]),
    cardWidth: {
      get() {
        return this.width || this.$mediasoup.VIDEO_CONSTRAINS[this.resolution].width.ideal
      },
      set() {}
    },
    audioDevice: {
      get() {
        if (this.microphone.device) {
          return {
            text: this.microphone.device.label,
            value: this.microphone.device.deviceId
          }
        }
        return null
      },
      set(value) {
        let res = null;
        if (typeof value === "string") {
          res = value
        } else {
          res = value.label || value.deviceId
        }
        let device = this.getAudioDeviceByValue(res);
        return this.changeAudioDevice(device)
      }
    },
    videoDevice: {
      get() {
        if (this.webcam.device) {
          return {
            text: this.webcam.device.label,
            value: this.webcam.device.deviceId
          }
        }
        return null;
      },
      set(value) {
        let res = null;
        if (typeof value === "string") {
          res = value
        } else {
          res = value.label || value.deviceId
        }
        let device = this.getVideoDeviceByValue(res)
        return this.changeWebcamDevice(device)
      }
    }
  },
  methods: {
    ...mapGetters([

    ]),
    ...mapMutations([
      'deleteMedias',
      'changeWebcamResolution',
      'changeWebcamDevice',
      'changeAudioDevice'
    ]),
    async initialize() {
      this.audioStream = this.createAudioStream();
      this.videoStream = this.createVideoStream();
      if (this.hasVideo) {
        let options = null;
        if (this.webcam.resolution) {
          options = { ...this.$mediasoup.VIDEO_CONSTRAINS[this.webcam.resolution]
          }
        }
        if (this.webcam.device) {
          options.deviceId = {
            ideal: this.webcam.device.deviceId
          }
        }
        await this.getVideoUserMedia(options)
      }
      if (this.hasAudio) {
        let options = {};
        if (this.microphone.device) {
          options.deviceId = {
            ideal: this.microphone.device.deviceId
          }
        }
        await this.getAudioUserMedia(options);
      }
      if (this.hasScreen) {
        await this.getUserScreen();
      }
      if (this.hasNoise) {
        await this.getWhiteNoise();
      }
    },
    async changeDevice(type) {
      switch (type) {
        case "audio":
          await this.getAudioUserMedia({
            deviceId: {
              ideal: this.microphone.device.deviceId
            }
          });
          break;
        case "video":
          {
            let options = { ...this.$mediasoup.VIDEO_CONSTRAINS[this.webcam.resolution]
            }
            options.deviceId = {
              ideal: this.webcam.device.deviceId
            }
            await this.getVideoUserMedia(options);
            break;
          }
      }
    },
    createAudioStream(stream) {
      let audioStream = null;
      if (stream) {
        audioStream = stream;
      } else {
        audioStream = new this.$nodefony.client.medias.Stream(this.$refs["preaudio"]);
      }
      audioStream.on("onloadedmetadata", () => {
        this.log(`Audio Stream : ${audioStream.streamId} onloadedmetadata`, "DEBUG");
      });
      audioStream.on("playing", () => {
        this.loading = false;
        this.log(`Audio Stream : ${audioStream.streamId} playing`, "DEBUG");
      });
      return audioStream;
    },
    createVideoStream(stream) {
      let videoStream = null;
      if (stream) {
        videoStream = stream;
      } else {
        videoStream = new this.$nodefony.client.medias.Stream(this.$refs["prevideo"]);
      }
      videoStream.on("onloadedmetadata", () => {
        this.log(`Video Stream : ${videoStream.streamId} onloadedmetadata`, "DEBUG");
      });
      videoStream.on("playing", () => {
        this.loading = false;
        this.log(`Video Stream : ${videoStream.streamId} playing`, "DEBUG");
      });
      return videoStream;
    },

    // mediasoup
    addProducer(producer) {
      return this.addTracks(producer.track);
    },
    deleteProducer(producer) {
      return this.deleteTracks(producer.track);
    },
    addConsumer(consumer) {
      return this.addTracks(consumer.track);
    },

    // tracks
    async addTracks(track) {
      switch (track.kind) {
        case "audio":
          await this.addAudioTrack(track)
          this.log(`${this.name} Add audio track ${track.id}`);
          if (this.local) {
            this.audio = true;
            return track;
          }
          return await this.audioStream.attachStream()
            .then(() => {
              this.audio = true;
              return track;
            });
        case "video":
          await this.addVideoTrack(track);
          this.log(`${this.name} Add video track ${track.id}`)
          return await this.videoStream.attachStream()
            .then(() => {
              this.video = true;
              return track;
            });
      }
    },
    deleteTracks(track) {
      switch (track.kind) {
        case "audio":
          this.log(`${this.name} Delete audio track ${track.id}`);
          return this.deleteAudioTrack();
        case "video":
          this.log(`${this.name} Delete video track ${track.id}`);
          return this.deleteVideoTrack();
      }
    },
    async addAudioTrack(track) {
      if (this.audioStream) {
        await this.stopAudioStream();
        this.audioStream.addTrack(track);
        if (this.spectrum) {
          this.$spectrum = await this.$nodefony.drawSpectrum(this.$refs.canvas, this.audioStream.stream, 5);
        }
        return track
      }
    },
    async deleteAudioTrack() {
      if (this.audioStream) {
        return await this.stopAudioStream();
      }
    },
    async addVideoTrack(track) {
      if (this.videoStream) {
        await this.stopVideoStream();
        return this.videoStream.addTrack(track);
      }
    },
    async deleteVideoTrack() {
      if (this.videoStream) {
        return await this.stopVideoStream();
      }
    },

    // stream
    async stopAudioStream() {
      if (this.audioStream) {
        const tracks = this.audioStream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        return await this.audioStream.detachStream();
        //this.audioStream = null;
      }
    },
    async stopVideoStream() {
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        return await this.videoStream.detachStream();
        //this.videoStream = null;
      }
    },

    async getWhiteNoise(reso) {
      let resolution = this.$mediasoup.VIDEO_CONSTRAINS[reso || this.resolution];
      let width = parseInt(resolution.width.ideal, 10);
      let height = parseInt(resolution.height.ideal, 10);
      this.log(`generate video white noise [${width},${height}]`)
      return await this.videoStream.whiteNoise(width, height)
        .then((stream) => {
          this.noise = true;
          this.videoStream.attachStream();
          stream.getVideoTracks()[0]
            .addEventListener('ended', () => {
              this.$emit("endwhitenoise", stream);
            });
          return stream;
        })
        .catch(e => {
          this.noise = false;
          this.log(e, "ERROR");
          throw e;
        });
    },

    async getUserScreen(settings) {
      return await this.videoStream.getUserScreen({
          audio: false,
          video: settings
        })
        .then((stream) => {
          this.screen = true;
          this.videoStream.attachStream();
          stream.getVideoTracks()[0]
            .addEventListener('ended', () => {
              this.$emit("endsharescreen", stream);
            });
          return stream;
        })
        .catch(e => {
          this.screen = false;
          this.log(e, "ERROR");
          throw e;
        })
    },

    async getAudioUserMedia(settings) {
      //this.logger(`Change Stream`, settings);
      return await this.audioStream.getUserMedia({
          audio: settings,
          video: false
        }).then(async (stream) => {

          this.audio = true;
          if (this.remote) {
            this.audioStream.attachStream();
          }
          if (this.spectrum) {
            if (this.$spectrum) {
              this.$spectrum.start(stream);
            } else {
              this.$spectrum = await this.$nodefony.drawSpectrum(this.$refs.canvas, stream, 5);
            }
          }
          this.log(`Device : ${stream.getAudioTracks()[0].label}`);
          this.audioDevice = stream.getAudioTracks()[0];
          return stream;
        })
        .catch(e => {
          this.audio = false;
          this.log(e, "ERROR");
          throw e;
        });

    },

    async getVideoUserMedia(settings) {
      return await this.videoStream.getUserMedia({
          audio: false,
          video: settings
        }).then((stream) => {
          this.video = true;
          this.videoStream.attachStream();
          this.log(`Device : ${stream.getVideoTracks()[0].label}`);
          this.videoDevice = stream.getVideoTracks()[0];
          return stream;
        })
        .catch(e => {
          this.video = false;
          this.log(e, "ERROR");
          throw e;
        });
    },

    // medias
    async changeVideoFormat(format) {
      this.log(`Change video format ${format}`, "DEBUG");
      if (this.video) {
        this.resolution = format;
        this.webcam.resolution = format;
        this.cardWidth = this.$mediasoup.VIDEO_CONSTRAINS[format].width.ideal;
        let options = { ...this.$mediasoup.VIDEO_CONSTRAINS[format]
        }
        if (this.webcam.device) {
          options.deviceId = {
            ideal: this.webcam.device.deviceId
          }
        }
        return await this.getVideoUserMedia(options);
      }
      if (this.screen) {
        return await this.getUserScreen(this.$mediasoup.VIDEO_CONSTRAINS[format]);
      }
      if (this.noise) {
        return await
        this.getWhiteNoise(format)
      }
    },

    async changeMedia(selected) {
      this.log(`changeMedia ${selected}`, "DEBUG");
      switch (selected) {
        case 'video':
          if (this.screen) {
            await this.videoStream.detachStream();
            this.screen = false;
            this.deleteMedias('screen');
          }
          if (this.noise) {
            await this.videoStream.detachStream();
            this.noise = false;
            this.deleteMedias('noise');
          }
          if (this.video && !this.hasVideo) {
            await this.videoStream.detachStream();
            this.video = false;
          }
          break;
        case 'screen':
          if (this.video) {
            await this.videoStream.detachStream();
            this.video = false;
            this.deleteMedias('video');
          }
          if (this.noise) {
            await this.videoStream.detachStream();
            this.noise = false;
            this.deleteMedias('noise');
          }
          if (this.screen && !this.hasScreen) {
            await this.videoStream.detachStream();
            this.screen = false;
          }
          break;
        case 'audio':
          if (this.audio && !this.hasAudio) {
            await this.audioStream.detachStream();
            if (this.$spectrum) {
              this.$spectrum.stop();
            }
            this.audio = false;
          }
          break;
        case 'noise':
          if (this.video) {
            await this.videoStream.detachStream();
            this.video = false;
            this.deleteMedias('video');
          }
          if (this.screen) {
            await this.videoStream.detachStream();
            this.screen = false;
            this.deleteMedias('screen');
          }
          if (this.noise && !this.hasNoise) {
            await this.videoStream.detachStream();
            this.noise = false;
          }
          break;
        default:
          return;
      }

      if (!this.audio && this.hasAudio) {
        let options = {};
        if (this.microphone.device) {
          options.deviceId = {
            ideal: this.microphone.device.deviceId
          }
        }
        await this.getAudioUserMedia(options)
          .catch(e => {
            throw {
              type: "audio",
              error: e
            };
          });
      }
      if (!this.noise && this.hasNoise) {

        return await this.getWhiteNoise()
          .catch(e => {
            throw {
              type: "noise",
              error: e
            };
          });
      }
      if (!this.screen && this.hasScreen) {
        return await this.getUserScreen()
          .catch(e => {
            throw {
              type: "screen",
              error: e
            };
          });
      }
      if (!this.video && this.hasVideo) {
        let options = null;
        if (this.webcam.resolution) {
          options = { ...this.$mediasoup.VIDEO_CONSTRAINS[this.webcam.resolution]
          }
        }
        if (this.webcam.device) {
          options.deviceId = {
            ideal: this.webcam.device.deviceId
          }
        }
        return await this.getVideoUserMedia(options)
          .catch(e => {
            throw {
              type: "video",
              error: e
            };
          });
      }
    },
    toggle() {
      if (this.elevation === 12) {
        this.elevation = 0;
        this.hover = false;
      } else {
        this.elevation = 12;
        this.hover = true;
      }
    },
    muteTag() {
      let tag = this.$refs["preaudio"];
      this.log(`Mute audio `);
      tag.muted = true;
      this.audio = false;
    },
    demuteTag() {
      let tag = this.$refs["preaudio"];
      this.log(`Demute audio `);
      tag.muted = false;
      this.audio = true;
    }

  }
}
</script>

<style scoped lang="scss">
.focus {
    border: 1px solid blue;
}
</style>
