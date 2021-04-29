<template>
<v-container v-if="room" fluid class="ma-0 pa-0">
  <room-tool-bar-top :roomid="roomid" v-on:quit="close" />
  <v-row style="margin-top:65px">

    <v-col cols="6" class="pa-10 ma-0" style='height:100%;width:100%'>
      <v-row justify="center" align="center" style='height:100%;width:100%'>
        <media-card-peer init spectrum ref="peer" :remote="peer" width="100%" @endsharescreen='endsharescreen' :name="getProfileUsername" showOptions>
          <template slot="peer">
            <v-container fluid class="pa-0">
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
          <v-row justify="center" class="mt-0 mb-5 mx-5">

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

            <!--v-col cols="3" v-if="false">
              <v-btn small color="blue-grey" class="ma-2 white--text" fab>
                <v-icon v-if="hasScreen">mdi-monitor-share</v-icon>
                <v-icon v-else dark>mdi-monitor-off</v-icon>
              </v-btn>
              <v-switch v-model="medias" value="screen" label="Screen" hide-details v-on:change='changeMedia("screen")'></v-switch>
            </v-col>

            <v-col cols="3" v-if="false">
              <v-btn small color="blue-grey" class="ma-2 white--text" fab>
                <v-icon v-if="hasNoise">mdi-monitor-share</v-icon>
                <v-icon v-else dark>mdi-monitor-off</v-icon>
              </v-btn>
              <v-switch v-model="medias" value="noise" label="Noise" hide-details v-on:change='changeMedia("noise")'></v-switch>
            </v-col-->

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
          </v-row>
        </v-card>
      </v-row>
    </v-col>

  </v-row>
</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import MediaCardPeer from '@/components/meetings/medias/peers/MediaCardPeer';
import ViewPeers from "@/components/meetings/peers/viewPeers";
import RoomToolBarTop from '@/components/meetings/nav/RoomToolBarTop';
export default {
  name: 'JoinMeeting',
  components: {
    "media-card-peer": MediaCardPeer,
    "view-peers": ViewPeers,
    "room-tool-bar-top": RoomToolBarTop,
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
      medias: null
    }
  },
  beforeRouteLeave(to, from, next) {
    this.openNavBar();
    return next();
  },

  async created() {
    if (!this.room) {
      this.redirect("HomeMeeting")
        .then(() => {
          this.openNavBar();
          //this.notify(this.log("Room not ready", "WARNING"))
        })
    }
    return await this.refresh()
      .catch(e => {
        this.log(e, "ERROR");
        return this.$router.push({
          name: "Logout",
        });
      })
  },
  destroyed() {
    this.log(`destroy join component `, "DEBUG");
    //this.$mediasoup.removeListener("waiting", this.onWaiting);
    this.$mediasoup.removeListener("closeSock", this.sockClose);
  },

  beforeMount() {
    this.closeDrawer();
    this.closeNavBar();
    this.medias = ["audio", "video"];
    this.storeMedias(this.medias);
    this.loading = true;
  },
  async mounted() {
    await this.getDevices()
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
    this.peerComponent = this.$refs["peer"];
    //this.$mediasoup.on("waiting", this.onWaiting);
    this.$mediasoup.once("closeSock", this.sockClose);
  },
  computed: {
    ...mapGetters({
      room: 'getRoomEntity',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'hasRole',
      'getPeers',
      "hasAudio",
      "hasVideo",
      "hasScreen",
      "hasNoise",
      'getProfileUsername',
      'getProfileName',
      'getProfileSurname'
    ]),
    /*peers: {
      get() {
        return this.getPeers;
      },
      set(value) {
        this.setPeers(value);
      }
    },*/
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
    /*peersFilter() {
      if (this.peers) {
        return this.peers.filter((peer) => {
          if (peer.id !== this.getProfileUsername) {
            return peer;
          }
        });
      }
      return [];
    }*/
  },
  watch: {
    message(value) {
      if (value) {
        this.notify(value, {
          offset: 65,
        });
      }
    }
  },
  methods: {
    ...mapMutations([
      'storeMedias',
      'deleteMedias',
      'setAudioStream',
      'setVideoStream',
      'setPeers',
      'closeDrawer',
      'closeNavBar',
      'openNavBar',
      //'changeWebcamResolution',
      //'changeWebcamDevice'
    ]),
    ...mapActions([
      'getDevices'
    ]),
    ...mapActions({
      refresh: 'AUTH_REFRESH'
    }),

    /*onWaiting(message) {
      if (message.message) {
        let pdu = this.log(message.message, "DEBUG");
        this.message = pdu;
      }
      if (message.peers) {
        this.peers = message.peers;
      }
    },*/
    redirect(routeName) {
      return this.$router.replace({
          name: routeName,
          params: {
            roomid: this.roomid
          }
        })
        .catch(() => {})
    },
    changeMedia(selected) {
      this.$nextTick(async () => {
        let status = null;
        switch (selected) {
          case "audio":
            status = !this.hasAudio;
            break;
          case "video":
            status = !this.hasVideo;
            break;
        }
        await this.peerComponent.changeMedia(selected, status)
          .then((response) => {
            this.storeMedias(this.medias);
            return response;
          })
          .catch(e => {
            if (e.type) {
              this.deleteMedias(e.type);
            }
          });
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
    sockClose() {
      this.redirect("HomeMeeting")
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
