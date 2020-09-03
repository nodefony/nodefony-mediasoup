<template>
<v-card class="peer " :max-width="'max-width'" :max-height="'max-height'">
  <v-system-bar color="indigo darken-2" dark>
    <v-spacer></v-spacer>

    <v-icon>mdi-window-minimize</v-icon>

    <v-icon>mdi-window-maximize</v-icon>

    <v-icon @click="agree"> mdi-close</v-icon>
  </v-system-bar>
  <v-container v-if="room.connected" fluid>
    <v-responsive :aspect-ratio="16/9">
      <video muted autoPlay :controls="false" class="video" :srcObject="videoStream" :stream="videoStream" :ref="getRef('video')">
      </video>
      <audio style="display:none" :muted="isMe" :controls="false" :srcObject="audioStream" :stream="audioStream" :ref="getRef('audio')">
      </audio>
    </v-responsive>
  </v-container>
  <v-container class="fill-height" v-if="! room.connected" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-avatar color="blue-grey" size="125">
          <span class="white--text headline">{{peer.id}}</span>
        </v-avatar>
      </v-col>
    </v-row>
  </v-container>
  <v-card-title v-if="! room.connected" class="headline">
    Join to {{room.id}} Meeting ?
  </v-card-title>
  <v-card-subtitle>
    Peer : {{peer.id}}
  </v-card-subtitle>
  <v-card-actions>
    <v-btn small v-if="! room.connected" id="desagree" class="ma-3" @click="agree">Disagree</v-btn>
    <v-btn small v-if="! room.connected" id="agree" class="ma-3" outlined @click="agree">Agree</v-btn>

    <v-btn v-if="room.connected" small :loading="loadingVideo" :disabled="loadingVideo" color="blue-grey" class="ma-2 white--text" fab @click="videoButton">
      <v-icon v-if="this.video">mdi-video-box</v-icon>
      <v-icon v-else dark>mdi-video-box-off</v-icon>
    </v-btn>

    <v-btn v-if="room.connected" small :loading="loadingAudio" :disabled="loadingAudio" color="blue-grey" class="ma-2 white--text" fab @click="audioButton">
      <v-icon v-if="this.audio">mdi-volume-high</v-icon>
      <v-icon v-else dark>mdi-volume-off</v-icon>
    </v-btn>

    <v-btn v-if="room.connected" small :loading="loadingMonitor" :disabled="loadingMonitor" color="blue-grey" class="ma-2 white--text" fab @click="monitorButton">
      <v-icon v-if="this.monitor">mdi-monitor-share</v-icon>
      <v-icon v-else dark>mdi-monitor-off</v-icon>
    </v-btn>

    <v-spacer></v-spacer>
    <v-btn v-if="room.connected" icon @click="show = !show">
      <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
    </v-btn>
  </v-card-actions>

  <v-expand-transition>
    <div v-show="show">
      <v-divider></v-divider>
      <v-card-text>

      </v-card-text>
    </div>
  </v-expand-transition>
</v-card>
</template>


<script>
export default {
  name: 'Peer',
  components: {},
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
    },
    isMe: {
      type: Boolean,
      default: false
    },
    "max-width": {
      type: [String, Number],
      default: 600
    },
    "max-height": {
      type: [String, Number],
      default: 300
    }
  },
  data: (vm) => ({
    show: false,
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
          if (this.isMe) {
            this.$refs[this.refAudio].muted = true;
          }
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
      let response = null;
      switch (event.currentTarget.id) {
        case "agree":
          response = true;
          break;
        default:
          response = false;
      }
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

    },
    audio() {
      if (this.video === false && this.audio === false) {
        return this.video = true;
      }
    },
    monitor() {
      this.video = false;

    }
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.peer {
  /*width: 400px;
  height: 300px;*/
}

.video {
  /*width: 100%;
  height: 100%;*/
  width: 300px !important;
  height: auto !important;
}
</style>
