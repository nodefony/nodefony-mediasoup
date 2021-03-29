<template>
<v-card dark v-bind="{...$props, ...$attrs}" tile flat outlined :style="styleCard" :class="classFocus">

  <v-hover v-slot="{ hover }" :disabled="hoverDisabled">

    <v-row v-if="peer" class="pa-0 ma-0" style="width:100%;height:100%" justify="center" align="center">

      <!--v-icon v-if="!peer.audioPaused" class="ma-2" color="blue-grey" left style="position:absolute;top:0px;left:0px">
        mdi-volume-high
      </v-icon>
      <v-icon v-else class="ma-2" color="blue-grey" left style="position:absolute;top:0px;left:0px">
        mdi-volume-off
      </v-icon-->

      <v-avatar v-if="!video" style="position:absolute;" color="primary" class="white--text" :size="50">
        {{peer.getInitial()}}
      </v-avatar>

      <video muted :ref="`vid-preview-${peer.id}`" :style="styleVideo">
      </video>
      <media-volume-peer fab absolute rounded top left color="blue-grey" :volume="volume" :muted="audio" class="mt-5" />

      <div v-show="hover" style="position:absolute;top:0px;right:0px">
        <v-chip class="ma-2" color="blue-grey" pill>
          <v-icon left>
            mdi-account
          </v-icon>
          {{name}} {{surname}}
        </v-chip>
      </div>
    </v-row>

  </v-hover>
</v-card>
</template>

<script>
import {
  mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';
import Volume from '@/components/meetings/medias/peers/MediaVolumePeer';

export default {
  name: 'previewPeer',
  components: {
    "media-volume-peer": Volume
  },
  props: {
    peerid: {
      type: String
    },
    currentfocus: {
      type: String
    }
  },
  data() {
    return {
      focus: null,
      classFocus: '',
      videoStream: null,
      audioStream: null,
      audio: false,
      video: false,
      //volume: 0,
      hoverDisabled: false,
      styleCard: {
        background: 'transparent',
        border: '1px solid #035a5a',
        borderRadius: '8px !important'
      }
    }
  },
  destroyed() {
    this.videoStream = null;
    this.audioStream = null;
    this.cleanVideoTag();
  },
  mounted() {
    this.$nextTick(() => {
      this.audio = this.peer.audioPaused;
      this.videoStream = this.peer.videoStream;
      this.audioStream = this.peer.audioStream;
      this.playPeer();
    });
  },
  watch: {
    'peer.volume': {
      handler(value) {
        this.volume = value;
      },
      immediate: true
    },
    'peer.videoPaused': {
      handler(value) {
        this.video = value;
      },
      immediate: true
    },
    'peer.audioPaused': {
      handler(value) {
        if (value === null) {
          this.audio = true;
        } else {
          this.audio = value;
        }
      },
      immediate: true
    },
    /*'peer.audioStream': {
      handler(value) {
        console.log(value)
      },
      deep: true
    },*/
    'peer.videoStream': {
      deep: true,
      async handler(value) {
        this.videoStream = value;
        this.video = false;
        if (this.peer.hasVideoConsumer()) {
          return this.playPeer();
        }
      }
    },
    currentfocus(value) {
      //console.log(`I am ${this.peerid} focus change to: `, value, this.focus);
      if (value === this.peerid) {
        this.classFocus = 'focus'
        if (this.focus !== null) {
          clearTimeout(this.focus);
        }
        this.focus = setTimeout(() => {
          this.classFocus = '';
          this.focus = null;
        }, 3000);
      } else {
        this.classFocus = ''
        if (this.focus !== null) {
          clearTimeout(this.focus);
          this.focus = null;
        }
      }
      return value;
    }
    /*peer: {
      deep: true,
      handler(value) {
        console.log("passs")
        this.video = false;
        this.videoStream = value.videoStream;
        if (this.videoStream && this.videoStream.stream) {
          //this.videoStream.once("playing", () => {
          this.playPeer();
          //});
        }
        this.audioStream = value.audioStream;
        //this.volume = value.volume;
      }
    }*/
  },
  computed: {
    ...mapGetters(['peers']),
    ...mapGetters({
      me: 'getPeer'
    }),
    maxHeight() {
      if (this.$attrs["max-height"]) {
        return this.$attrs["max-height"];
      }
      return null;
    },
    minHeight() {
      if (this.$attrs["min-height"]) {
        return this.$attrs["min-height"];
      }
      return null;
    },
    maxWidth() {
      if (this.$attrs["max-width"]) {
        return this.$attrs["max-width"];
      }
      return null;
    },
    minWidth() {
      if (this.$attrs["min-width"]) {
        return this.$attrs["min-width"];
      }
      return null;
    },
    styleVideo() {
      let style = {
        width: "100%",
        height: "100%",
        borderRadius: "8px"
      };
      if (this.maxHeight) {
        style.maxHeight = this.maxHeight;
      }
      if (this.maxHeight) {
        style.minHeight = this.minHeight;
      }
      if (this.maxWidth) {
        style.maxWidth = this.maxWidth;
      }
      if (this.minWidth) {
        style.minWidth = this.minWidth;
      }
      return style
    },
    peer() {
      return this.getPeerById(this.peerid)
    },
    volume: {
      get() {
        return this.peer.volume;
      },
      set(value) {
        return value;
      }
    },
    name() {
      if (this.peer) {
        if (this.peer.user) {
          return this.peer.user.name
        }
        return this.peer.displayNane || this.peer.id
      }
      return ''
    },
    surname() {
      if (this.peer) {
        if (this.peer.user) {
          return this.peer.user.surname
        }
        return this.peer.id
      }
      return ''
    }

  },
  methods: {
    cleanVideoTag() {
      if (this.peer) {
        let indexTag = `vid-preview-${this.peer.id}`;
        let videoTag = this.$refs[indexTag];
        if (!videoTag) {
          return null;
        }
        if (videoTag[0]) {
          videoTag = videoTag[0];
        }
        if (!videoTag) {
          return null;
        }
        videoTag.srcObject = null;
        return videoTag;
      }
      return null;
    },
    async playPeer() {
      if (this.peer && this.videoStream && this.videoStream.stream) {
        let videoTag = this.cleanVideoTag(); //this.$refs[indexTag];
        videoTag.srcObject = this.videoStream.stream;
        if (!videoTag) {
          return Promise.reject(new Error('No video tag found'));
        }
        if (this.videoStream.stream.active) {
          return videoTag.play()
            .then(() => {
              this.video = true;
              return Promise.resolve(this.videoStream.stream)
            })
            .catch(e => {
              this.video = false;
              this.log(e, "ERROR");
            });
        } else {
          this.videoStream.once("playing", () => {
            return videoTag.play()
              .then(() => {
                this.video = true;
                return Promise.resolve(this.videoStream.stream)
              })
              .catch(e => {
                this.video = false;
                this.log(e, "ERROR");
              });
          });
        }
      } else {
        //this.log(new Error('No video Stream found'), "WARNING");
      }
    },
    getPeerById(peerid) {
      if (this.me.id === peerid) {
        return this.me
      }
      return this.peers.find((peer) => {
        if (peer.id === peerid) {
          return peer;
        }
      });
    },
  }
}
</script>

<style scoped lang="scss">
.focus {
    border: 1px solid cyan !important;
}
</style>
