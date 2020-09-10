<template>
<v-card class="peer" :max-width="maxWidth" :max-height="maxHeight" :min-width="minWidth" :min-height="minHeight">

  <v-system-bar color="indigo darken-2" dark>
    <v-spacer></v-spacer>
    <v-icon v-if="mdRoom && mdRoom.connected" @click="minimize">
      mdi-window-minimize
    </v-icon>
    <v-icon v-if="mdRoom && mdRoom.connected" @click="maximize">
      mdi-window-maximize
    </v-icon>
    <v-icon name ="close" @click="close"> mdi-close</v-icon>
  </v-system-bar>

  <v-expand-transition>
    <div v-show="!isMinimize">
      <v-container v-if="mdPeer" style="padding:0px;width:100%">
        <div class="media-content">
          <video autoPlay muted playsinline :controls="false" :srcObject="videoStream" ref="video">
          </video>
          <audio autoPlay playsinline :controls="false" style="display:none" :muted="isMe" :srcObject="audioStream" ref="audio">
          </audio>
          <v-btn v-if="mdRoom && mdRoom.connected" small :loading="loadingAudio" :disabled="loadingAudio" color="blue-grey" class="ma-2 white--text buttons" fab @click="audioButton">
            <v-icon v-if="this.audio">mdi-volume-high</v-icon>
            <v-icon v-else dark>mdi-volume-off</v-icon>
          </v-btn>
        </div>
      </v-container>

      <v-card-actions>
        <v-btn v-if="mdRoom && mdRoom.connected" small :loading="loadingVideo" :disabled="loadingVideo" color="blue-grey" class="ma-2 white--text" fab @click="videoButton">
          <v-icon v-if="this.video">mdi-video-box</v-icon>
          <v-icon v-else dark>mdi-video-box-off</v-icon>
        </v-btn>
        <v-btn v-if="mdRoom && mdRoom.connected" small :loading="loadingAudio" :disabled="loadingAudio" color="blue-grey" class="ma-2 white--text" fab @click="audioButton">
          <v-icon v-if="this.audio">mdi-volume-high</v-icon>
          <v-icon v-else dark>mdi-volume-off</v-icon>
        </v-btn>
        <v-btn v-if="mdRoom && mdRoom.connected" small :loading="loadingMonitor" :disabled="loadingMonitor" color="blue-grey" class="ma-2 white--text" fab @click="monitorButton">
          <v-icon v-if="this.monitor">mdi-monitor-share</v-icon>
          <v-icon v-else dark>mdi-monitor-off</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn v-if="mdRoom && mdRoom.connected" icon @click="expendMenu">
          <v-icon>{{ showExpend ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        </v-btn>
      </v-card-actions>
    </div>
  </v-expand-transition>

  <v-expand-transition>
    <div v-show="isMinimize">
      <v-container style="padding:0px">
        <v-img height="100%" src="https://cdn.vuetifyjs.com/images/cards/server-room.jpg">
          <v-row align="end" class="fill-height">
            <v-col align-self="start" class="pa-0" cols="12">
              <v-avatar class="profile" color="grey" size="164" tile>
                <v-img src="https://cdn.vuetifyjs.com/images/profiles/marcus.jpg"></v-img>
              </v-avatar>
            </v-col>
            <v-col class="py-0">
              <v-list-item color="rgba(0, 0, 0, .4)" dark>
                <v-list-item-content>
                  <v-list-item-title class="title">Marcus Obrien</v-list-item-title>
                  <v-list-item-subtitle>Network Engineer</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-col>
          </v-row>
        </v-img>
      </v-container>
    </div>
  </v-expand-transition>

  <v-expand-transition>
    <div v-show="showExpend">
      <v-divider></v-divider>
      <v-card-text>
        <h1>jjjj</h1>
      </v-card-text>
    </div>
  </v-expand-transition>
</v-card>
</template>

<script>
export default {
  name: 'Media',
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
    maxWidth: {
      type: [String, Number],
      default: 600
    },
    maxHeight: {
      type: [String, Number],
      default: 800
    },
    minHeight: {
      type: [String, Number],
      default: 200
    },
    minWidth: {
      type: [String, Number],
      default: 300
    }
  },
  data: (vm) => ({
    mdRoom: vm.room,
    mdPeer: vm.peer,
    showExpend: false,
    isMinimize: false,
    isMaximize: false,
    refAudio: null,
    refVideo: null,
    videoStream: new window.MediaStream(),
    audioStream: new window.MediaStream(),
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
      console.log( this.$refs["audio"] )
      console.log( this.$refs["video"])
      switch (track.kind) {
        case "audio":
          {
            let tag = this.$refs["audio"] ;
            this.audioStream.addTrack(track);
            if (this.isMe) {
              this.muteTag();
            }
            tag.srcObject = this.audioStream;
            //this.$refs[this.refAudio].stream = this.audioStream;
            return tag
              .play()
              .catch((error) => {
                this.log('audio.play() failed')
                this.log(error, "ERROR")
              });
          }
        case "video":
          {
            let tag = this.$refs["video"] ;
            //this.videoStream = new MediaStream();
            this.videoStream.addTrack(track);
            tag.srcObject = this.videoStream;
            //this.$refs[this.refVideo].stream = this.videoStream;
            return this.playVideoTag();
          }
      }
    },
    getRef(type) {
      if (type === 'video') {
        this.refVideo = `video-${this.mdPeer.id}`;
        return this.refVideo;
      }
      if (type === 'audio') {
        this.refAudio = `audio-${this.mdPeer.id}`;
        return this.refAudio;
      }
      return this.mdPeer.id;
    },
    videoButton() {
      this.video = !this.video;
      // tag
      if (this.video) {
        return this.playVideoTag();
      } else {
        return this.pauseVideoTag();
      }
    },
    audioButton() {
      this.audio = !this.audio;
      // tag
      if (this.isMe) {
        return;
      }
      if (this.audio) {
        this.demuteTag();
      } else {
        this.muteTag();
      }
    },
    monitorButton() {
      this.monitor = !this.monitor;
    },
    muteTag() {
      let tag = this.$refs["audio"] ;
      tag.muted = true;
      if (this.isMe) {
        return;
      }
      this.audio = false;
    },
    demuteTag() {
      let tag = this.$refs["audio"] ;
      tag.muted = false;
      this.audio = true;
    },
    playVideoTag() {
      let tag = this.$refs["video"] ;
      console.log(tag)
      return tag.play()
        .then(() => {
          this.video = true;
          this.demuteTag();
        })
        .catch(e => {
          this.log(e, "ERROR", "PLAY VIDEO ");
        })
    },
    pauseVideoTag() {
      try {
        let tag = this.$refs["video"] ;
        tag.pause();
        this.video = false;
        this.muteTag();
      } catch (e) {
        this.log(e, "ERROR", "PAUSE VIDEO");
      }
    },
    close(event) {
      let response = null;
      switch (event.currentTarget.name) {
        case "close":
          response = true;
          break;
        default:
          response = false;
      }
      this.log(`response : ${response}`, "DEBUG");
      this.$emit('close', response);
    },
    minimize() {
      return this.isMinimize = !this.isMinimize;
    },
    maximize() {
      return this.isMaximize = !this.isMaximize;
    },
    expendMenu() {
      return this.showExpend = !this.showExpend;
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

.media-content {
  position: relative
}

.media-content video {
  /*width: 100%;
  height: 100%;*/
  width: 100% !important;
  height: auto !important;
}

.buttons {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
