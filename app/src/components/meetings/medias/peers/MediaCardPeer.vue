<template>
<v-card :width="cardWidth" :height="height" class="rounded-lg" :elevation="elevation" :outlined="hover" :min-width="minWidth" :max-width="maxWidth" :max-height="maxHeight" :min-height="minHeight" :loading="loading" rounded @click="toggle" :class="{ focus: focus}"
  style="background:transparent;" :dark="dark">

  <media-volume-peer v-if="volume" fab rounded absolute top left color="blue-grey" class=" white--text mt-5" :volume="this.volume || 0" :muted="local ? !hasAudio : !audio" />

  <slot name="peer"></slot>

  <v-container fluid class="pa-0">
    <!-- VIDEO -->
    <v-hover v-slot="{ hover }" :disabled="hoverDisabled">
      <v-row class="pa-0 ma-0">
        <v-container v-show="video || screen || noise" fluid class="pa-0 ma-0">

          <v-row justify="center" align="center" class="pa-0 ma-0">
            <div v-show="hover || !video " style="position:absolute">
              <v-avatar color="primary" class="white--text" :size="50">{{remote ? remote.getInitial() : ""}}</v-avatar>
            </div>
            <video style="width:100%;border-radius:8px 8px 0 0;" class="pa-0 ma-0" muted playsinline :controls="false" ref="prevideo" />
          </v-row>

        </v-container>

        <v-container v-show="(!video && !screen && !noise)" fluid class="pa-0">

          <v-container fluid fill-height style="min-height:120px;background-color:#034750;opacity:0.5;border-radius:8px 8px 0 0;" class="pa-0 ma-0">
            <v-row justify="center" align="center">
              <div style="position:absolute">
                <v-avatar color="primary" class="white--text" :size="50">{{remote ? remote.getInitial() : ""}}</v-avatar>
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
  //mapActions
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
    },
    dark: {
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
      idMediasoup: null,
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
    if (this.remote) {
      this.log(`initialize remote stream`);
      this.log(this.remote, "DEBUG")
      if (this.remote.audioStream) {
        this.audioStream = this.createAudioStream(this.remote.audioStream);
      } else {
        this.audioStream = this.createAudioStream();
      }
      this.audioStream.mediaElement = this.$refs["preaudio"];
      if (this.remote.videoStream) {
        this.videoStream = this.createVideoStream(this.remote.videoStream);
      } else {
        this.videoStream = this.createVideoStream();
      }
      this.videoStream.mediaElement = this.$refs["prevideo"];
    } else {
      if (this.init) {
        await this.initialize();
        if (this.showOptions) {
          //this.initDevices();
        }
      } else {
        this.audioStream = this.createAudioStream();
        this.audioStream.mediaElement = this.$refs["preaudio"];
        this.videoStream = this.createVideoStream();
        this.videoStream.mediaElement = this.$refs["prevideo"];
      }
    }
  },
  async beforeDestroy() {
    this.log(`Try Destroy peer component ${this.name}`, "DEBUG");
    if (!this.local || this.$route.name !== "Meeting") {
      await this.stopAudioStream();
      await this.stopVideoStream();
    }
    if (this.$spectrum) {
      await this.$spectrum.stop();
    }
  },
  async destroyed() {
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
      //"hasNoise",
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
    ...mapGetters([]),
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
          .catch((e) => {
            this.log(e, "WARNING")
          })
      }
      if (this.hasAudio) {
        let options = {};
        if (this.microphone.device) {
          options.deviceId = {
            ideal: this.microphone.device.deviceId
          }
        }
        await this.getAudioUserMedia(options)
          .catch((e) => {
            this.log(e, "WARNING")
          })
      }
      /*if (this.hasScreen) {
        await this.getUserScreen()
          .catch((e) => {
            this.log(e, "WARNING")
          })
      }
      if (this.hasNoise) {
        await this.getWhiteNoise()
          .catch((e) => {
            this.log(e, "WARNING")
          })
      }*/
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
      /*audioStream.on("onloadedmetadata", () => {
        this.log(`Audio Stream : ${audioStream.streamId} onloadedmetadata`, "DEBUG");
      });*/
      audioStream.on("playing", () => {
        this.loading = false;
        this.log(`Audio Stream : ${audioStream.streamId} playing`, "DEBUG");
        if (this.remote) {
          this.audio = !this.remote.audioPaused
        } else {
          this.audio = true;
        }
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
      /*videoStream.on("onloadedmetadata", () => {
        this.log(`Video Stream : ${videoStream.streamId} onloadedmetadata`, "DEBUG");
      });*/
      videoStream.on("playing", () => {
        this.loading = false;
        this.log(`Video Stream : ${videoStream.streamId} playing`, "DEBUG");
        this.video = true;
        if (this.remote) {
          this.video = !this.remote.VIDEOPaused
        } else {
          this.video = true;
        }
      });
      return videoStream;
    },

    // mediasoup
    addProducer(producer) {
      this.idMediasoup = producer.id
      return this.addTracks(producer.track);
    },
    deleteProducer(producer) {
      this.idMediasoup = null
      return this.deleteTracks(producer.track);
    },
    addConsumer(consumer) {
      this.idMediasoup = consumer.id
      return this.addTracks(consumer.track);
    },
    deleteConsumer(consumer) {
      this.idMediasoup = null
      return this.deleteTracks(consumer.track);
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
            /*.then(() => {
              this.audio = true;
              return track;
            })*/
            .catch(e => {
              this.audio = false;
              //this.deleteMedias('audio');
              this.log(e, "ERROR");
            });
        case "video":
          await this.addVideoTrack(track);
          this.log(`${this.name} Add video track ${track.id}`)
          return await this.videoStream.attachStream()
            /*.then(() => {
              this.video = true;
              return track;
            })*/
            .catch(e => {
              this.video = false;
              //this.deleteMedias('video');
              this.log(e, "ERROR");
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
          try {
            this.$spectrum = await this.$nodefony.drawSpectrum(this.$refs.canvas, this.audioStream.stream, 5);
          } catch (e) {
            this.log(e, "ERROR");
          }
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
        return await this.audioStream.detachStream()
          .then((res) => {
            this.audio = false;
            //this.deleteMedias('audio');
            return res;
          });
        //this.audioStream = null;
      }
    },
    async stopVideoStream() {
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        return await this.videoStream.detachStream()
          .then((res) => {
            this.video = false;
            //this.deleteMedias('video');
            return res;
          });
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
              this.noise = false;
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
              this.share = false;
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
              if (this.$refs.canvas) {
                this.$spectrum = await this.$nodefony.drawSpectrum(this.$refs.canvas, stream, 5);
              } else {
                this.log(`Canvas component not ready`, "ERROR");
              }
            }
          }
          this.log(`Device : ${stream.getAudioTracks()[0].label}`);
          this.audioDevice = stream.getAudioTracks()[0];
          return stream;
        })
        .catch(e => {
          this.audio = false;
          this.deleteMedias('audio');
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
          this.deleteMedias('video');
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
      /*if (this.screen) {
        return await this.getUserScreen(this.$mediasoup.VIDEO_CONSTRAINS[format]);
      }
      if (this.noise) {
        return await
        this.getWhiteNoise(format)
      }*/
    },

    async changeMedia(selected, status) {
      this.log(`changeMedia ${selected} : ${status}`, "DEBUG");
      switch (selected) {
        case 'video':
          if (!status && this.video) {
            await this.videoStream.detachStream();
          }
          this.video = status;
          if (this.video) {
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
          break;
        case 'audio':
          if (!status && this.audio) {
            await this.audioStream.detachStream();
            if (this.$spectrum) {
              this.$spectrum.stop();
            }
          }
          this.audio = status;
          if (this.audio) {
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
          break;
        default:
          return;
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
      this.log(`${this.name} Mute audio `, "DEBUG");
      tag.muted = true;
      this.audio = false;
    },
    demuteTag() {
      let tag = this.$refs["preaudio"];
      this.log(`${this.name} Demute audio `, "DEBUG");
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
