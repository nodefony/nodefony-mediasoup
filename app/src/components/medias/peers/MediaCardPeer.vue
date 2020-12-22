<template>
<v-card :width="cardWidth" :height="height" class="rounded-lg" :elevation="elevation" :outlined="hover" min-width="250" :loading="loading" rounded @click="toggle">

  <slot name="peer">
    <v-container v-if="local" fluid class="pa-0">
      <v-btn color="primary" fab rounded absolute top left>
        {{this.getTrigramme}}
      </v-btn>
      <v-card-title class="ml-10">
        <p class="ml-3">
          {{this.getUser}}
        </p>
      </v-card-title>
    </v-container>
  </slot>

  <v-container fluid class="pa-0">
    <!-- VIDEO -->
    <v-row class="pa-0 ma-0">
      <v-hover v-slot="{ hover }" :disabled="hoverDisabled">
        <v-container v-show="video || screen || noise" fluid class="pa-0">
          <video style="width:100%;height:100%" class="pa-0 ma-0" muted playsinline :controls="false" ref="prevideo" />
          <div v-if="hover" style="position:absolute;">
            <slot name="hover"></slot>
          </div>
        </v-container>
      </v-hover>

      <v-container v-show="(!video && !screen && !noise)" fluid class="pa-0">
        <v-hover v-slot="{ hover }" :disabled="hoverDisabled">
          <v-container class="pa-0">
            <v-row justify="center" class="">
              <v-avatar color="primary" size="123">{{getTrigramme}}</v-avatar>
              <div v-if="hover" style="position:absolute;">
                <slot name="hover"></slot>
              </div>
            </v-row>
          </v-container>
        </v-hover>
      </v-container>

    </v-row>
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
              <v-select dense :items="audioDevices" label="Audio Devices" outlined></v-select>
            </v-col>
            <v-col v-if="this.video" class="d-flex" cols="12" sm="6">
              <v-select dense :items="videoDevices" label="Videos Devices" outlined></v-select>
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

export default {
  name: 'MediaCardPeer',
  props: {
    local: {
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
    height: {
      type: String
    },
    showOptions: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {
      message: null,
      loading: false,
      elevation: 4,
      hoverDisabled: false,
      hover: false,
      resolution: "qvga",
      audioDevices: [],
      videoDevices: [],
      devices: [],
      audio: null,
      video: null,
      screen: null,
      noise: null,
      audioStream: null,
      videoStream: null,
      options: {
        videos: ['hd', 'vga', 'qvga'],
        constrains: vm.$mediasoup.VIDEO_CONSTRAINS
      }
    }
  },
  async mounted() {
    if (this.local) {
      this.audioStream = this.createAudioStream();
      this.videoStream = this.createVideoStream();
      await this.getDevices();
      if (this.hasVideo) {
        await this.getVideoUserMedia(this.video ? this.$mediasoup.VIDEO_CONSTRAINS[this.resolution] : this.video);
      }
      if (this.hasAudio) {
        await this.getAudioUserMedia(this.audio);
      }
      if (this.hasScreen) {
        await this.getUserScreen();
      }
      if (this.hasNoise) {
        await this.getWhiteNoise();
      }
    }
    if (this.remote && this.active) {
      this.log(`initialize remote stream`)
      if (this.remote.audioStream) {
        if (this.remote.audioStream.mediaElement) {
          //this.remote.audioStream.mediaElement.srcObject = null;
        }
        this.audioStream = this.createAudioStream(this.remote.audioStream);
        this.audioStream.mediaElement = this.$refs["preaudio"];
        this.audioStream.setStream();
      } else {
        this.createAudioStream();
      }
      if (this.remote.videoStream) {
        if (this.remote.videoStream.mediaElement) {
          //this.remote.videoStream.mediaElement.srcObject = null
        }
        this.videoStream = this.createVideoStream(this.remote.videoStream);
        this.videoStream.mediaElement = this.$refs["prevideo"];
        this.videoStream.setStream();
      } else {
        this.createVideoStream();
      }
      this.log(this.audioStream, "DEBUG");
      this.log(this.videoStream, "DEBUG");
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
    ...mapGetters({
      getTrigramme: 'getTrigramme',
      getUser: "getUser",
      hasAudio: "hasAudio",
      hasVideo: "hasVideo",
      hasScreen: "hasScreen",
      hasNoise: "hasNoise"
    }),
    cardWidth() {
      return this.width || this.$mediasoup.VIDEO_CONSTRAINS[this.resolution].width.ideal
    }
  },
  methods: {
    ...mapMutations([
      'setAudioStream',
      'setVideoStream',
      'deleteMedias',
    ]),
    createAudioStream(stream) {
      let audioStream = null;
      if (stream) {
        audioStream = stream;
      } else {
        audioStream = new this.$nodefony.client.medias.Stream(this.$refs["preaudio"]);
        this.setAudioStream(audioStream);
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
        this.setVideoStream(videoStream);
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
    async getDevices() {
      this.devices = await this.$nodefony.client.medias.getDevices()
      this.audioDevices = this.cleanDevice(this.$nodefony.client.medias.audioDevices)
      this.videoDevices = this.cleanDevice(this.$nodefony.client.medias.webcams)
    },
    cleanDevice(map) {
      return Array.from(map).map(([name, value]) => {
        return value.label
      });
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
          this.log(`${this.name} Add audio track ${track.id}`)
          if (this.local) {
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
      return await this.audioStream.getUserMedia({
          audio: settings,
          video: false
        }).then(async (stream) => {
          this.audio = true;
          if (!this.local) {
            this.audioStream.attachStream();
          }
          if (this.spectrum) {
            if (this.$spectrum) {
              this.$spectrum.start(stream);
            } else {
              this.$spectrum = await this.$nodefony.drawSpectrum(this.$refs.canvas, stream, 5);
            }
          }
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
        this.cardWidth = this.$mediasoup.VIDEO_CONSTRAINS[format].width.ideal;
        return await this.getVideoUserMedia(this.$mediasoup.VIDEO_CONSTRAINS[format]);
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
        await this.getAudioUserMedia(true)
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
        return await this.getVideoUserMedia(this.$mediasoup.VIDEO_CONSTRAINS[this.resolution])
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
    }

  }
}
</script>

<style scoped lang="scss">

</style>
