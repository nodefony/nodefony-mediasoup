<template>
<v-dialog v-model="getJoinDialog" fullscreen hide-overlay transition="dialog-bottom-transition">

  <v-card :loading="loading" class="">
    <v-toolbar color="" flat dense fixed top>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ room ? room.name : ''}}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>

    <template slot="progress">
      <v-progress-linear color="deep-purple" height="10" indeterminate></v-progress-linear>
    </template>

    <v-container v-show="room" fluid class="mt-5">
      <v-row no-gutters>
        <v-col cols="6" class="pa-3 ma-0">
          <v-row justify="center">
            <media-card-peer init spectrum ref="peer" @endsharescreen='endsharescreen' :name="getProfileUsername" showOptions>
              <template slot="peer">
                <v-container fluid class="pa-0">
                  <!--v-btn color="primary" fab rounded absolute top left>
                    {{getTrigramme}}
                  </v-btn-->
                  <v-card-title class="ml-10">
                    <p class="ml-3">
                      {{getProfileName}} {{getProfileSurname}}
                    </p>
                  </v-card-title>

                </v-container>
              </template>
            </media-card-peer>
          </v-row>
        </v-col>

        <v-col cols="6" class="px-10">
          <v-row justify="center">
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
              <v-card-title>{{room? room.name : ""}}</v-card-title>

              <v-row class="mt-0 mb-5 mx-5" width="100%">
                <!--v-card-text>
                  <v-text-field v-model="peerid" :disabled="isAuthenticated" label="User" :value="peerid"></v-text-field>
                  <span class="caption grey--text text--darken-1">
                    This is the name you will use to login to Room
                  </span>
                </v-card-text-->
                <v-simple-table dense fixed-header height="200px" style="width:100%">
                  <template v-slot:top>
                    <v-icon class="mx-5 my-3">mdi-account</v-icon>
                    <span> Participants</span>
                  </template>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th class="text-left">
                          Participants
                        </th>
                        <th class="text-left">
                          Display Name
                        </th>
                        <th class="text-left">
                          Status
                        </th>
                        <th v-if="true" class="text-left">

                        </th>
                      </tr>
                    </thead>
                    <tbody v-show="peers">
                      <tr v-for="peer in peers" :key="peer.username">
                        <td>{{ peer.id }}</td>
                        <td>{{ peer.displayName }}</td>
                        <td>{{ peer.status }}</td>
                        <td v-if="true">
                          <v-btn x-small @click="authorise(item)">Authorised</v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-row>
              <v-row align="center" justify="space-around">
                <v-btn @click.end="close" rounded color="primary">
                  Quit
                </v-btn>
                <v-btn @click.end="acceptConnect" rounded color="primary">
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

import MediaCardPeer from './medias/peers/MediaCardPeer';

export default {
  name: 'DialogJoin',
  components: {
    "media-card-peer": MediaCardPeer
  },
  props: {},
  data(vm) {
    return {
      loading: false,
      message: null,
      peer: null,
      peerid: null,
      audio: true,
      video: true,
      screen: false
    }
  },
  async mounted() {
    this.loading = true;
    this.peerid = this.getProfileUsername;
    await this.getDevices()
      .then((devices) => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
    this.peer = this.$refs["peer"];
    this.log(`User : ${this.getProfileUsername}`, "DEBUG");
  },
  destroyed() {},
  computed: {
    ...mapGetters({
      room: 'getRoomEntity',
      peers: 'getPeers'
    }),
    ...mapGetters([
      'getProfileUsername',
      //"getProfile",
      'getProfileName',
      'getProfileSurname',
      "getJoinDialog",
      "isAuthenticated",
      "hasAudio",
      "hasVideo",
      "hasScreen",
      "hasNoise",
      'getTrigramme',
      'getMedias'
      //'webcam',
    ]),
    medias: {
      get() {
        return this.getMedias;
      },
      set(value) {
        return this.storeMedias(value);
      }
    }
  },
  watch: {

  },
  methods: {
    ...mapMutations([
      'closeJoinDialog',
      'storeMedias',
      'deleteMedias',
      'setAudioStream',
      'setVideoStream',
      //'changeWebcamResolution',
      //'changeWebcamDevice'
    ]),
    ...mapActions([
      'getDevices'
    ]),

    async changeMedia(selected) {
      await this.peer.changeMedia(selected)
        .then(() => {
          this.storeMedias(this.medias);
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
      this.loading = false;
      this.setAudioStream(this.peer.audioStream);
      this.setVideoStream(this.peer.videoStream);
      return this.$emit("join", this);
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
.nodefony--background {
    position: relative;
    height: 100vh;
    width: 100%;
    /*display: flex;
    align-items: center;
    justify-content: center;*/
    background-image: url("../../assets/chateau-if.jpg");
    background-size: cover;
    overflow: hidden;
}

.nodefony--background::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.65);
}
</style>
