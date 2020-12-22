<template>
<v-dialog v-model="getJoinDialog" fullscreen hide-overlay transition="dialog-bottom-transition">

  <v-card :loading="loading">
    <v-toolbar dark color="primary" flat>
      <v-btn icon dark @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ $t("rooms.name")}} {{roomid}}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <nodefony-notify v-if="messageroom" :pdu="messageroom" type="alert" />

    <template slot="progress">
      <v-progress-linear color="deep-purple" height="10" indeterminate></v-progress-linear>
    </template>

    <v-container v-show="room" fluid class="mt-15">
      <v-row no-gutters>
        <v-col cols="6" class="pa-3 ma-0">
          <v-row justify="center">
            <media-card-peer width="500" local spectrum ref="peer" @endsharescreen='endsharescreen' :name="getUser" showOptions>
              <template slot="peer"></template>
            </media-card-peer>
          </v-row>
        </v-col>

        <v-col cols="6" class="px-10">
          <v-row justify="center">
            <nodefony-notify v-if="message" :pdu="message" type="alert" />
            <v-card width="100%" flat tile>
              <v-card-title>Medias Settings</v-card-title>
              <v-row justify="space-between" class="mt-0 mb-5 mx-5">

                <v-col cols="3">
                  <v-btn small color="blue-grey" class="ma-2 white--text" fab>
                    <v-icon v-if="hasAudio">mdi-volume-high</v-icon>
                    <v-icon v-else dark>mdi-volume-off</v-icon>
                  </v-btn>
                  <v-switch v-model="medias" value="audio" label="Audio" hide-details v-on:change='changeMedia("audio")'></v-switch>
                </v-col>

                <v-col cols="3">
                  <v-btn small color="blue-grey" class="ma-2 white--text" fab>
                    <v-icon v-if="hasVideo">mdi-video-box</v-icon>
                    <v-icon v-else dark>mdi-video-box-off</v-icon>
                  </v-btn>
                  <v-switch v-model="medias" value="video" label="Video" hide-details v-on:change='changeMedia("video")'></v-switch>
                </v-col>

                <v-col cols="3">
                  <v-btn small color="blue-grey" class="ma-2 white--text" fab>
                    <v-icon v-if="hasScreen">mdi-monitor-share</v-icon>
                    <v-icon v-else dark>mdi-monitor-off</v-icon>
                  </v-btn>
                  <v-switch v-model="medias" value="screen" label="Screen" hide-details v-on:change='changeMedia("screen")'></v-switch>
                </v-col>

                <v-col cols="3">
                  <v-btn small color="blue-grey" class="ma-2 white--text" fab>
                    <v-icon v-if="hasNoise">mdi-monitor-share</v-icon>
                    <v-icon v-else dark>mdi-monitor-off</v-icon>
                  </v-btn>
                  <v-switch v-model="medias" value="noise" label="Noise" hide-details v-on:change='changeMedia("noise")'></v-switch>
                </v-col>

              </v-row>
              <v-divider class="mx-4"></v-divider>
              <v-card-title>Room {{roomid}}</v-card-title>

              <v-row justify="space-between" class="mt-0 mb-5 mx-5">
                <v-card-text>
                  <v-text-field v-model="peerid" :disabled="isAuthenticated" label="User" :value="peerid"></v-text-field>
                  <span class="caption grey--text text--darken-1">
                    This is the name you will use to login to Room
                  </span>
                </v-card-text>
                <v-card-text>
                  <v-text-field v-model="password" label="Password" type="password" :disabled="room && ! room.secure"></v-text-field>
                  <span class="caption grey--text text--darken-1">
                    Please enter a password for join room
                  </span>
                </v-card-text>
                <v-btn @click.end="acceptConnect" rounded color="primary" dark>
                  Join Room
                </v-btn>
              </v-row>

            </v-card>

          </v-row>
        </v-col>
      </v-row>
    </v-container>

  </v-card>
</v-dialog>
</template>
<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

import MediaCardPeer from '../medias/peers/MediaCardPeer';
import notify from '@/plugins/nodefony/components/notify.vue';

export default {
  name: 'DialogJoin',
  components: {
    "media-card-peer": MediaCardPeer,
    "nodefony-notify": notify
  },
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {
      loading: false,
      message: null,
      messageroom: null,
      room: null,
      peer: null,
      peerid: null,
      audio: true,
      video: true,
      screen: false,
      medias: vm.$store.state.room.medias,
      password: ""
    }
  },
  async mounted() {
    this.loading = true;
    this.peerid = this.getUser;
    this.room = await this.getRoom(this.roomid)
      .then((room) => {
        this.loading = false;
        this.peer = this.$refs["peer"];
        this.logger(`User Profile : `, this.getProfile);
        this.log(`User : ${this.getUser}`, "DEBUG");
        return room;
      })
      .catch(e => {
        this.loading = false;
        if (e.response) {
          this.messageroom = this.log(e.response.message, "ERROR", "ROOM")
        }
      });
  },

  computed: {
    ...mapGetters({
      getUser: "getUser",
      getProfile: "getProfile",
      getJoinDialog: "getJoinDialog",
      isAuthenticated: "isAuthenticated",
      hasAudio: "hasAudio",
      hasVideo: "hasVideo",
      hasScreen: "hasScreen",
      hasNoise: "hasNoise"
    })
  },
  methods: {
    ...mapMutations([
      'closeJoinDialog',
      'setMedias',
      'deleteMedias',
      'setAudioStream',
      'setVideoStream'
    ]),
    // room
    async getRoom(id) {
      try {
        this.log("Get rooms", "DEBUG");
        let res = await this.$mediasoup.api.http(`room/${id}`)
          .catch(e => {
            throw e;
          });
        let room = res.result;
        this.log(room, "DEBUG");
        return room;
      } catch (e) {
        this.log(e, "ERROR");
        throw e;
      }
    },

    async changeMedia(selected) {
      this.setMedias(this.medias);
      await this.peer.changeMedia(selected)
        .then(() => {
          this.setAudioStream(this.peer.audioStream);
          this.setVideoStream(this.peer.videoStream);
          this.setMedias(this.medias);
        })
        .catch(e => {
          if (e.type) {
            this.deleteMedias(e.type);
          }
        });
    },
    endsharescreen() {
      this.deleteMedias("screen");
    },
    acceptConnect() {
      //checkroom accees
      let body = {
        password: this.password,
        username: this.peerid,
        room: this.room.name
      }
      this.loading = true;
      return this.$mediasoup.api.post(`access/room/${this.room.name}`, {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          this.loading = false;
          this.$emit("join", res, this);
          //this.$destroy();
          return res;
        })
        .catch(e => {
          this.loading = false;
          if (e.response) {
            // log error
            this.message = this.log(e.response.message, "ERROR", "Authentication")
          }
        })
    },
    close() {
      this.$emit("close", this);
      this.closeJoinDialog();
    }
  }
}
</script>

<style scoped lang="scss">
.v-dialog {
    z-index: 10000;
}
</style>
