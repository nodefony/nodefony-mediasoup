<template>
<v-card dark v-bind="{...$props, ...$attrs}" tile flat outlined :style="styleCard">

  <v-hover v-slot="{ hover }" :disabled="hoverDisabled">

    <v-row class="pa-0 ma-0" style="width:100%;height:100%" justify="center" align="center">

      <!--v-icon v-if="!peer.audioPaused" class="ma-2" color="blue-grey" left style="position:absolute;top:0px;left:0px">
        mdi-volume-high
      </v-icon>
      <v-icon v-else class="ma-2" color="blue-grey" left style="position:absolute;top:0px;left:0px">
        mdi-volume-off
      </v-icon-->

      <media-volume-peer fab absolute rounded top left color="blue-grey" :volume="volume" :muted="audio" class="mt-5" />

      <v-avatar v-if="!video" style="position:absolute;" color="primary" class="white--text" :size="50">
        {{peer.getInitial()}}
      </v-avatar>

      <div v-show="hover" style="position:absolute;top:0px;right:0px">
        <v-chip class="ma-2" color="blue-grey" pill>
          <v-icon left>
            mdi-volume-high
          </v-icon>
          {{name}} {{surname}}
        </v-chip>
      </div>

      <video :ref="`vid-preview-${peer.id}`" style="width:100%;height:100%;border-radius:8px;" />
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
    }
  },
  data() {
    return {
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
        this.audio = value;
      },
      immediate: true
    },
    'peer.videoStream': {
      deep: true,
      handler(value) {
        this.video = false;
        this.videoStream = value;
        if (this.videoStream && this.videoStream.stream) {
          this.playPeer();
        }
      }
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
        if (!videoTag) {
          return Promise.reject(new Error('No video tag found'));
        }
        videoTag.srcObject = this.videoStream.stream;
        this.$nextTick(() => {
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
        /*setTimeout(() => {

        }, 100);*/
        //}
        //console.log(videoTag.paused, this.videoStream.stream.active, this.videoStream.stream.ended)
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
    border: 1px solid cyan;
}
</style>
