<template>
<v-card dark v-bind="{...$props, ...$attrs}" tile flat outlined :style="styleCard">

  <v-hover v-slot="{ hover }" :disabled="hoverDisabled">

    <!--media-volume-peer fab rounded top left color="cyan accent-4" :volume="volume" :muted="audio" /-->

    <v-row class="pa-0 ma-0" style="width:100%;height:100%" justify="center" align="center">

      <v-icon class="ma-2" color="blue-grey" left style="position:absolute;top:0px;left:0px">
        mdi-volume-high
      </v-icon>

      <v-avatar v-if="!video" style="position:absolute;" color="primary" class="white--text" :size="50">
        {{peer.getInitial()}}
      </v-avatar>

      <div v-show="hover" style="position:absolute;top:0px;right:0px">
        <v-chip class="ma-2" color="blue-grey" pill>
          <v-icon left>
            mdi-volume-high
          </v-icon>
          {{peer.user.name}} {{peer.user.surname}}
        </v-chip>
      </div>

      <video :ref="`vid-preview-${peer.id}`" style="width:100%;height:100%;border-radius:8px;" />
    </v-row>

  </v-hover>
</v-card>
</template>

<script>
import {
  //mapGetters,
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
    peer: {
      type: Object
      //default: null
    }
  },
  data() {
    return {
      videoStream: null,
      audioStream: null,
      audio: false,
      video: false,
      volume: 0,
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
    setTimeout(() => {
      this.$nextTick(() => {
        this.videoStream = this.peer.videoStream;
        this.audioStream = this.peer.audioStream;
        this.playPeer();
      });
    }, 200);
  },
  watch: {
    /*'peer.volume': {
      handler(value) {
        this.volume = value;
      },
      deep: true
    },*/
    peer: {
      deep: true,
      handler(value) {
        this.video = false;
        this.videoStream = value.videoStream;
        if (this.videoStream && this.videoStream.stream) {
          //this.videoStream.once("playing", () => {
          this.playPeer();
          //});
        }
        this.audioStream = value.audioStream;
        this.volume = value.volume;
      }
    }
  },
  methods: {
    cleanVideoTag() {
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
    }
  }
}
</script>

<style scoped lang="scss">
.focus {
    border: 1px solid cyan;
}
</style>
