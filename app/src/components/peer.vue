<template>
<!--dash-item v-bind.sync="item" :key="`item-${name}`"-->
<v-card flat elevation="0" class="mycard mycolor">
  <v-row>
    <video class="video" :srcObject="videoStream" :stream="videoStream" :ref="getRef('video')">
    </video>
    <audio :srcObject="audioStream" :stream="audioStream" :ref="getRef('audio')">
    </audio>
    <v-avatar color="blue-grey" size="100">
      <span class="white--text headline">{{peer.id}}</span>
    </v-avatar>
  </v-row>
  <v-card-title v-if="join" class="headline">Join to {{room.id}} Meeting ?</v-card-title>
  <v-card-text class="mycolor">
  </v-card-text>
  <v-card-actions>
    <v-spacer></v-spacer>
    <v-row v-if="join" justify="center">
      <v-btn id="desagree" class="ma-3" outlined color="white" @click="agree">Disagree</v-btn>
      <v-btn id="agree" class="ma-3" outlined color="white" @click="agree">Agree</v-btn>
    </v-row>
    <v-row justify="center">
      <v-btn :loading="loadingVideo" :disabled="loadingVideo" color="blue-grey" class="ma-2 white--text" fab @click="videoButton">
        <v-icon v-if="this.video">mdi-video-box</v-icon>
        <v-icon v-else dark>mdi-video-box-off</v-icon>
      </v-btn>

      <v-btn :loading="loadingAudio" :disabled="loadingAudio" color="blue-grey" class="ma-2 white--text" fab @click="audioButton">
        <v-icon v-if="this.audio">mdi-volume-high</v-icon>
        <v-icon v-else dark>mdi-volume-off</v-icon>
      </v-btn>

      <v-btn :loading="loadingMonitor" :disabled="loadingMonitor" color="blue-grey" class="ma-2 white--text" fab @click="monitorButton">
        <v-icon v-if="this.monitor">mdi-monitor-share</v-icon>
        <v-icon v-else dark>mdi-monitor-off</v-icon>
      </v-btn>
    </v-row>
  </v-card-actions>
</v-card>
<!--/dash-item-->
</template>

<script>
import {
  DashItem
} from "vue-responsive-dash";

export default {
  name: 'Peer',
  components: {
    DashItem
  },
  props: {
    name: {
      type: String,
      default: ""
    },
    join: {
      type: Boolean,
      default: false
    },
    room: {
      type: Object,
      default: null
    },
    peer: {
      type: Object,
      default: null
    },
    videoMediaStream: {
      type: Object,
      default: null
    },
    audioMediaStream: {
      type: Object,
      default: null
    }
  },
  data: (vm) => ({
    item: {
      id: `item-${vm.name}`,
      x: 0,
      y: 0,
      width: 1,
      height: 1
    },
    refAudio: null,
    refVideo: null,
    videoStream: new MediaStream(),
    audioStream: new MediaStream(),
    loadingVideo: false,
    loadingAudio: false,
    loadingMonitor: false,
    audio: true,
    video: true,
    monitor: false
  }),
  mounted() {},
  computed: {},
  methods: {
    addProducer(producer) {
      return this.addTracks(producer.track);
    },
    addConsumer(consumer) {
      return this.addTracks(consumer.track);
    },
    addTracks(track) {
      switch (track.kind) {
        case "audio":
          //this.audioStream = new MediaStream();
          this.audioStream.addTrack(track);
          this.$refs[this.refAudio].srcObject = this.audioStream;
          //this.$refs[this.refAudio].stream = this.audioStream;
          this.$refs[this.refAudio]
            .play()
            .catch((error) => {
              this.log('audio.play() failed')
              this.log(error, "ERROR")
            });
          break;
        case "video":
          //this.videoStream = new MediaStream();
          this.videoStream.addTrack(track);
          this.$refs[this.refVideo].srcObject = this.videoStream;
          //this.$refs[this.refVideo].stream = this.videoStream;
          this.$refs[this.refVideo]
            .play()
            .catch((error) => {
              this.log('video.play() failed')
              this.log(error, "ERROR")
            });
          break;
      }
    },
    getRef(type) {
      if (type === 'video') {
        this.refVideo = `video-${this.peer.id}`;
        return this.refVideo;
      }
      if (type === 'audio') {
        this.refAudio = `audio-${this.peer.id}`;
        return this.refAudio;
      }
      return this.peer.id;
    },
    videoButton() {
      this.video = !this.video;
    },
    audioButton() {
      this.audio = !this.audio;
    },
    monitorButton() {
      this.monitor = !this.monitor;
    },
    agree(event) {
      let response = event.currentTarget.id === "agree" ? true : false;
      this.log(`response : ${response}`, "DEBUG");
      this.$emit('join', response);
    }
  },
  watch: {
    video() {
      if (this.monitor) {
        return;
      }
      if (this.video === false && this.audio === false) {
        return this.audio = true;
      }
      this.room.getUserMedia({
          audio: this.audio,
          video: this.video
        }, this.$refs[this.refVideo])
        .then((stream) => {
          this.stream = stream;
          this.loader = null;
        })
        .catch(() => {
          this.stream = null;
          this.loader = null;
        });
    },
    audio() {
      if (this.video === false && this.audio === false) {
        return this.video = true;
      }
      this.room.getUserMedia({
          audio: this.audio,
          video: this.video
        }, this.$refs[this.refAudio])
        .then((stream) => {
          this.stream = stream;
          this.loader = null;
        })
        .catch(() => {
          this.stream = null;
          this.loader = null;
        });
    },
    monitor() {
      this.video = false;
      this.room.getUserScreen({}, this.$refs[this.peer.id])
        .then((stream) => {
          this.stream = stream;
          this.loader = null;
        })
        .catch(() => {
          this.stream = null;
          this.loader = null;
        });
    }
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.video {
  width: 100%;
  height: 200px;
}

.mycard {
  background-color: rgb(27, 38, 56, 0) !important;
}

.mycolor {
  color: rgb(120, 255, 255, 1) !important;
}

.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}

@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}

@-o-keyframes loader {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
