<template>
<v-card v-bind="{...$props, ...$attrs}" tile flat>
  <video :ref="`vid-preview-${peer.id}`" style="width:100%;height:100%;border-radius:8px;" />
</v-card>
</template>

<script>
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';

export default {
  name: 'previewPeer',
  components: {},
  props: {
    peer: {
      type: Object,
      default: null
    }
  },
  data(vm) {
    return {
      videoStream: null,
      audioStream: null,
      volume: null
    }
  },
  mounted() {
    setTimeout(() => {
      this.$nextTick(() => {
        this.videoStream = this.peer.videoStream;
        this.volume = this.peer.volume
      });
    }, 200);
  },
  watch: {
    peer: {
      deep: true,
      handler(value) {
        console.log(`handle peer deep`)
        this.videoStream = value.videoStream;
        if (this.videoStream && this.videoStream.stream) {
          this.playPeer();
        }
      }
    }
  },
  methods: {
    playPeer() {
      if (this.peer && this.videoStream && this.videoStream.stream) {
        let indexTag = `vid-preview-${this.peer.id}`;
        let videoTag = this.$refs[indexTag];
        if (!videoTag) {
          return Promise.resolve();
        }
        if (videoTag[0]) {
          videoTag = videoTag[0];
        }
        console.log(`Pass video paused : ${videoTag.paused}`);
        videoTag.srcObject = null;

        setTimeout(() => {
          videoTag.srcObject = this.videoStream.stream;
          return videoTag.play()
            .catch(e => {
              this.log(e, "ERROR");
            });
        }, 100);

        //}
        //console.log(videoTag.paused, this.videoStream.stream.active, this.videoStream.stream.ended)
      }
      return Promise.resolve();
    }
  }
}
</script>

<style scoped lang="scss">

</style>
