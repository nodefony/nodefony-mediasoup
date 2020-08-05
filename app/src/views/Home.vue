<template>
<v-row justify="center" class='home'>
  <v-container fluid class='home'>
    <video class="video" :stream="addStream" ref="video"></video>
  </v-container>
  <v-dialog v-model="dialog" persistent max-width="600">

    <v-card flat elevation="0" class="mycard mycolor">
      <v-row justify="center">
        <v-avatar color="blue-grey" size="100">
          <span class="white--text headline">{{peerid}}</span>
        </v-avatar>
      </v-row>
      <v-card-title class="headline">Join to {{roomid}} Meeting ?</v-card-title>
      <v-card-text class="mycolor">
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn outlined color="white" text @click="disagree">Disagree</v-btn>
        <v-btn outlined color="white" text @click="agree">Agree</v-btn>
      </v-card-actions>
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
    </v-card>
  </v-dialog>
</v-row>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {},
  props: {
    roomid: {
      type: String,
      default: "test"
    },
    peerid: {
      type: String,
      default: "cci"
    }
  },
  data() {
    return {
      loadingVideo: false,
      loadingAudio: false,
      loadingMonitor: false,
      loader: null,
      dialog: false,
      stream: null,
      audio: true,
      video: true,
      monitor: false,
      room: null,
      peer: null
    }
  },
  computed: {},
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
        }, this.$refs["video"])
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
        }, this.$refs["video"])
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
      this.room.getUserScreen({}, this.$refs["video"])
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
  async mounted() {
    await this.$mediasoup.connect(this.roomid, this.peerid)
      .then(({
        room,
        peer
      }) => {
        this.dialog = true;
        this.room = room;
        this.peer = peer;
        let settings = {
          audio: this.audio,
          video: this.video
        };
        this.room.getUserMedia(settings, this.$refs["video"])
          .then(async (stream) => {
            this.stream = stream;
          });
      })
      .catch((e) => {
        this.log(e);
      });
  },
  async created() {

  },
  methods: {
    videoButton() {
      this.video = !this.video;
    },
    audioButton() {
      this.audio = !this.audio;
    },
    monitorButton() {
      this.monitor = !this.monitor;
    },
    agree() {
      this.dialog = false;
      this.log("agree");
      this.$mediasoup.join();
    },
    disagree() {
      this.dialog = false;
      this.log("disagree")
    },
    async addStream() {
      if (this.stream && this.room) {
        return await this.room.mediaStream.reattachMediaStream(this.stream, this.$refs["video"])
      }
      return null;
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.home {
  width: 100%;
  height: 100%;
  background-color: rgb(27, 38, 56);
  padding: 0px;
  margin: 0px;
}

.video {
  width: 100%;
  height: 100%;
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
