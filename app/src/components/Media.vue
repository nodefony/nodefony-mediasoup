<template>
<v-card class="peer" :max-width="maxWidth" :max-height="maxHeight" :min-width="minWidth" :min-height="minHeight">

  <v-system-bar color="indigo darken-2" dark>
    <h5>{{this.name}}</h5>
    <v-spacer></v-spacer>
    <v-icon v-if="mdRoom && mdRoom.connected" @click="minimize">
      mdi-window-minimize
    </v-icon>
    <v-icon v-if="mdRoom && mdRoom.connected" @click="maximize">
      mdi-window-maximize
    </v-icon>
    <v-icon name="close" @click="close"> mdi-close</v-icon>
  </v-system-bar>

  <v-expand-transition>
    <div v-show="!isMinimize">
      <v-container v-if="mdPeer" style="padding:0px;width:100%">
        <div class="media-content">
          <video v-show="video" muted playsinline :controls="false" ref="video">
          </video>
          <div v-show="!video" class="pa-4 text-center">
            <v-avatar color="primary lighten-2" class="subheading white--text" size="100">
              {{this.name}}
            </v-avatar>
          </div>
          <audio playsinline :controls="false" style="display:none" :muted="isMe" ref="audio">
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
        <v-btn v-if="mdRoom && mdRoom.connected && isMe" small :loading="loadingMonitor" :disabled="loadingMonitor" color="blue-grey" class="ma-2 white--text" fab @click="monitorButton">
          <v-icon v-if="screen">mdi-monitor-share</v-icon>
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
      <Message />
    </div>
  </v-expand-transition>
</v-card>
</template>

<script>
import Message from "@/components/Message";
export default {
  name: 'Media',
  components: {
    Message
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
    refAudio: vm.$refs["audio"],
    refVideo: vm.$refs["video"],
    videoStream: null, //new window.MediaStream(),
    audioStream: null, //new window.MediaStream(),
    loadingVideo: false,
    loadingAudio: false,
    loadingMonitor: false,
    audio: true,
    video: true,
    screen: false,
    closed: false
  }),
  mounted() {},
  computed: {},
  destroyed() {
    this.mdRoom = null;
    this.mdPeer = null;
    this.stopAudioStream();
    this.stopVideoStream();
  },
  methods: {
    addProducer(producer) {
      return this.addTracks(producer.track);
    },
    deleteProducer(producer) {
      return this.deleteTracks(producer.track);
    },
    addConsumer(consumer) {
      return this.addTracks(consumer.track);
    },
    addAudioTrack(track) {
      if (this.audioStream) {
        this.stopAudioStream();
      }
      this.audioStream = new window.MediaStream();
      let tag = this.$refs["audio"];
      tag.srcObject = this.audioStream;
      this.audioStream.addTrack(track);
      if (this.isMe) {
        this.muteTag();
      }
      return tag;
    },
    deleteAudioTrack() {
      if (this.videoStream) {
        return this.stopAudioStream();
      }
    },
    addVideoTrack(track) {
      if (this.videoStream) {
        this.stopVideoStream();
      }
      this.videoStream = new window.MediaStream();
      //let tag = this.$refs["video"];
      //tag.srcObject = null;
      this.videoStream.addTrack(track);
      //tag.srcObject = this.videoStream;
      //return tag;
    },
    deleteVideoTrack() {
      if (this.videoStream) {
        return this.stopVideoStream();
      }
    },
    playVideoTag() {
      let tag = this.$refs["video"];
      this.log(`Try Play video User : ${this.name}`)
      tag.srcObject = this.videoStream;
      return tag.play()
        .then(() => {
          this.log(`play video tag User : ${this.name}`)
          this.video = true;
          //this.demuteTag();
        })
        .catch(e => {
          this.log(`Play video tag User : ${this.name}`, "ERROR");
          this.log(e, "ERROR", "PLAY VIDEO ");
        })
    },
    pauseVideoTag() {
      try {
        let tag = this.$refs["video"];
        this.log(`pause video tag ${this.name}`)
        tag.pause();
        this.video = false;
        //this.muteTag();
      } catch (e) {
        this.log(e, "ERROR", "PAUSE VIDEO");
      }
    },
    addTracks(track) {
      switch (track.kind) {
        case "audio":
          {
            let tag = this.addAudioTrack(track)
            this.log(`${this.name} Add audio track ${track.id}`)
            if (this.isMe) {
              return;
            }
            return tag
              .play()
              .then(() => {
                this.audio = true;
                this.log(`Play audio tag`);
              })
              .catch((error) => {
                this.log('audio.play() failed')
                this.log(error, "ERROR")
              });
          }
        case "video":
          {
            this.log(`${this.name} Add video track ${track.id}`)
            this.addVideoTrack(track)
            return this.playVideoTag();
          }
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
    stopAudioStream() {
      if (this.audioStream) {
        const tracks = this.audioStream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        this.audioStream = null;
      }
    },
    stopVideoStream() {
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        this.videoStream = null;
      }
    },
    async videoButton() {
      // tag
      if (this.video) {
        if (this.isMe) {
          await this.room.disableWebcam()
        }
        return this.pauseVideoTag();
      } else {
        if (this.isMe) {
          await this.room.enableWebcam()
        }
        return this.playVideoTag();
      }
    },
    async audioButton() {
      // tag

      if (this.audio) {
        if (this.isMe) {
          await this.room.muteMic()
        }
        this.muteTag();
      } else {
        if (this.isMe) {
          await this.room.unmuteMic()
        }
        this.demuteTag();
      }
    },
    monitorButton() {
      if (this.screen) {
        return this.room.disableShare()
          .then(() => {
            this.screen = false;
          })
      }
      return this.room.enableShare()
        .then(() => {
          this.screen = true;
        })
    },
    muteTag() {
      let tag = this.$refs["audio"];
      this.log(`Mute audio tag isme = ${this.isMe}`);
      tag.muted = true;
      if (this.isMe) {
        return;
      }
      this.audio = false;
    },
    demuteTag() {
      let tag = this.$refs["audio"];
      this.log(`DemuteTag audio tag isme = ${this.isMe}`);
      tag.muted = false;
      this.audio = true;
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
      return this.$emit('close', response);
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
  watch: {}
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
