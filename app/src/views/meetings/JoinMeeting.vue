<template>
<v-card :loading="loading" class="">
  <v-toolbar color="" flat dense fixed top>
    <v-toolbar-title>{{ room ? room.name : ''}}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <template slot="progress">
    <v-progress-linear color="deep-purple" height="10" indeterminate></v-progress-linear>
  </template>

  <v-container v-if="room" fluid class="mt-5">
    <v-row no-gutters>
      <v-col cols="6" class="pa-3 ma-0">
        <v-row justify="center">
          <media-card-peer init spectrum ref="peer" :remote="peer" @endsharescreen='endsharescreen' :name="getProfileUsername" showOptions>
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
              <view-peers view="simpleTable" dense />
            </v-row>
            <v-row align="center" justify="space-around">
              <v-btn @click.end="acceptConnect" rounded color="primary">
                Join Room
              </v-btn>
              <v-btn @click.end="close" rounded color="primary">
                Quit
              </v-btn>
            </v-row>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

</v-card>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import MediaCardPeer from '@/components/meetings/medias/peers/MediaCardPeer';
import ViewPeers from "@/components/meetings/peers/viewPeers";
export default {
  name: 'JoinMeeting',
  components: {
    "media-card-peer": MediaCardPeer,
    "view-peers": ViewPeers
  },
  props: {
    roomid: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      message: null,
      audio: true,
      video: true,
      screen: false
    }
  },
  created() {
    if (!this.room) {
      this.redirect("HomeMeeting")
        .then(() => {
          this.notify(this.log("Room not ready", "WARNING"))
        })
    }
  },
  destroyed() {
    this.log(`destroy join component `, "DEBUG");
    this.$mediasoup.removeListener("waiting", this.onWaiting);
  },
  async mounted() {
    this.loading = true;
    await this.getDevices()
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
    this.peerComponent = this.$refs["peer"];
    this.$mediasoup.on("waiting", this.onWaiting);
  },
  computed: {
    ...mapGetters({
      room: 'getRoomEntity',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'hasRole',
      'getPeers',
      'getMedias',
      "hasAudio",
      "hasVideo",
      "hasScreen",
      "hasNoise",
      'getProfileUsername',
      'getProfileName',
      'getProfileSurname'
    ]),
    peers: {
      get() {
        return this.getPeers;
      },
      set(value) {
        this.setPeers(value);
      }
    },
    medias: {
      get() {
        return this.getMedias;
      },
      set(value) {
        return this.storeMedias(value);
      }
    },
    isAdmin() {
      return this.hasRole("ROLE_ADMIN");
    },
    isRoomAdmin() {
      let tab = this.room.users.filter((admin) => {
        if (admin.username === this.getProfileUsername) {
          return admin;
        }
      });
      if (tab.length) {
        return this.getProfileUsername;
      }
      return false;
    },
    peersFilter() {
      if (this.peers) {
        return this.peers.filter((peer) => {
          if (peer.id !== this.getProfileUsername) {
            return peer;
          }
        });
      }
      return [];
    }
  },
  watch: {
    message(value) {
      this.notify(value);
    }
  },
  methods: {
    ...mapMutations([
      'storeMedias',
      'deleteMedias',
      'setAudioStream',
      'setVideoStream',
      'setPeers'
      //'changeWebcamResolution',
      //'changeWebcamDevice'
    ]),
    ...mapActions([
      'getDevices'
    ]),
    onWaiting(message) {
      let pdu = this.log(message.message, "DEBUG");
      this.message = pdu;
      if (message.peers) {
        this.peers = message.peers;
      }
    },
    redirect(routeName) {
      return this.$router.push({
          name: routeName,
          params: {
            roomid: this.roomid
          }
        })
        .catch(() => {})
    },
    async changeMedia(selected) {
      await this.peerComponent.changeMedia(selected)
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
      this.setAudioStream(this.peerComponent.audioStream);
      this.setVideoStream(this.peerComponent.videoStream);
      return this.redirect("Meeting");
    },
    authorise(peer) {
      if (this.isRoomAdmin) {
        this.loading = true;
        return this.$mediasoup.request(`meetings/${this.room.name}/${peer.id}/authorise`, "PUT")
          .then((data) => {
            this.loading = false;
            return data.result;
          })
          .catch(async (e) => {
            this.loading = false;
            this.message = this.log(e.message, "ERROR");
          });
      }
    },
    unauthorise(peer) {
      if (this.isRoomAdmin) {
        this.loading = true;
        return this.$mediasoup.request(`meetings/${this.room.name}/${peer.id}/unauthorise`, "PUT")
          .then((data) => {
            this.loading = false;
            return data.result;
          })
          .catch(async (e) => {
            this.loading = false;
            this.message = this.log(e.message, "ERROR");
          });
      }
    },
    async close() {
      await this.$mediasoup.leaveRoom()
        .then(() => {
          return this.redirect("HomeMeeting");
        })
        .catch(() => {
          return this.redirect("HomeMeeting");
        });
    }
  }
}
</script>

<style scoped lang="scss">

</style>
