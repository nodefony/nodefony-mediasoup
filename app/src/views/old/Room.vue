<template>
<v-app id="room">
  <!-- DIALOG ENTER -->
  <v-row justify="center">
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Join {{ $t("rooms.name")}} {{roomid}}</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>

        <v-row justify="center" class="mt-15">
          <v-card :width="videoWidth" :max-height="400">
            <video style="width:100%;height:100%;padding:0px;margin:0px" class="ma-0 mt-0" muted playsinline :controls="false" ref="prevideo" />
            <v-btn color="primary" fab rounded absolute top left>
              {{this.getTrigramme}}
            </v-btn>
            <v-card-title class="white--text overlayText">
              <p class="ml-3">
                {{this.getUser}}
              </p>
            </v-card-title>

            <v-toolbar dark color="teal lighten-1" style="top: -8px;">
              <v-spacer></v-spacer>
              <v-switch v-model="audio" label="Audio"></v-switch>
              <v-switch v-model="video" label="Video"></v-switch>
              <v-spacer></v-spacer>
              <v-btn @click.end="acceptConnect" rounded color="primary" dark>
                Join Room
              </v-btn>
            </v-toolbar>

            <v-subheader>Devices Settings</v-subheader>
            <v-row justify="space-between" class="mt-0">
              <v-col class="d-flex" cols="12" sm="6">
                <v-select dense :items="audioDevices" label="Audio Devices" outlined></v-select>
              </v-col>
              <v-col class="d-flex" cols="12" sm="6">
                <v-select dense :items="videoDevices" label="Videos Devices" outlined></v-select>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-subheader>Videos Settings</v-subheader>
            <v-row justify="space-around" class="mt-0">
              <v-col class="d-flex" cols="12" sm="6">
                <v-select dense :items="this.options.videos" label="Videos" outlined v-model="videoSettings" @change='changeFormat'>
                </v-select>
              </v-col>
            </v-row>
          </v-card>
        </v-row>
      </v-card>
    </v-dialog>
  </v-row>

  <v-system-bar window dark app fixed>
    <v-spacer></v-spacer>
    <v-icon @click.end="quit">mdi-close</v-icon>
  </v-system-bar>

  <v-navigation-drawer v-model="drawerRoom" class="pt-10" color="grey lighten-3" app>
  </v-navigation-drawer>

  <v-app-bar app class="mb-5">
    <v-app-bar-nav-icon @click.stop="toggelDrawerRoom"></v-app-bar-nav-icon>
    <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
      <span class="hidden-sm-and-down">Room {{ roomid }}</span>
    </v-toolbar-title>
    <v-spacer></v-spacer>
  </v-app-bar>

  <v-main v-show="!dialog" class="pa-0 ma-0">
    <v-container fluid class="">
      <v-row no-gutters style="flex-wrap: nowrap;">
        <v-col cols="9" style="min-width: 500px;" class="flex-grow-1 flex-shrink-0">
          <v-container v-show="loading" style="height: 400px;">
            <v-row class="fill-height" align-content="center" justify="center">
              <v-col cols="6">
                <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="3" style="min-width: 200px;" class="flex-grow-1 flex-shrink-0">
          <div>
            <div class="d-flex flex-column">
              <Media max-width="100%" v-show="peer && joined" :name="peerid" class="mt-5" :isMe="true" :ref="peerid" :room="room" :peer="peer" :key="peerid" v-on:close="quit" />
              <Media max-width="100%" class="mt-5" v-for=" (item) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id" :name="item.id">
              </Media>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <!-- DIALOG QUIT -->
  <v-dialog v-if='room' v-model="dialogQuit" persistent max-width="600">
    <v-row justify="center">
      <v-card min-width="600">
        <v-system-bar color="indigo darken-2" dark>
          <v-spacer></v-spacer>
          <v-icon @click="leave"> mdi-close</v-icon>
        </v-system-bar>
        <div class="pa-5">
          <v-card-title class="headline">
            Are you sure to want leave the room ?
          </v-card-title>
          <v-card-text>
            <v-row align="center" justify="center">
              <v-col cols="12" sm="8" md="4">
                <v-avatar color="blue-grey" size="125">
                  <span class="white--text headline">{{room.id}}</span>
                </v-avatar>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text id="disagree" @click="leave">Disagree</v-btn>
            <v-btn color="green darken-1" text id="agree" @click="leave">Agree</v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </v-row>
  </v-dialog>

</v-app>
</template>

<script>
import Media from "@/components/mediasoup/Media";
import nodefony from 'nodefony-client';
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'Room',
  components: {
    Media
  },
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {
      // room
      dialog: true,
      dialogQuit: false,
      loading: false,
      drawerRoom: JSON.parse(window.sessionStorage.getItem("drawerRoom") || false),
      audio: true,
      video: true,
      audioDevices: [],
      videoDevices: [],
      devices: vm.$nodefony.client.medias.devices,
      videoSettings: "qvga",
      videoWidth: vm.$mediasoup.VIDEO_CONSTRAINS["qvga"].width.ideal,
      options: {
        videos: ['hd', 'vga', 'qvga'],
        constrains: vm.$mediasoup.VIDEO_CONSTRAINS
      },
      // mediasoup
      joined: false,
      rooms: [],
      peers: [],
      room: null,
      peer: null,
      peerid: vm.getProfile ? vm.getProfile.username : null,
      connected: vm.isMediasoupConnected()
    }
  },
  destroyed() {
    this.peer = null;
    this.room = null;
  },
  //beforeMount() {
  async beforeCreate() {},
  async created() {
    this.peerid = this.getUser;
    await this.getRoom(this.roomid);
  },
  async mounted() {
    this.options.devices = await this.$nodefony.client.medias.getDevices();
    this.audioDevices = this.cleanDevice(this.$nodefony.client.medias.audioDevices)
    this.videoDevices = this.cleanDevice(this.$nodefony.client.medias.webcams)
    this.closeDrawer();
    this.log(`Monted Room ${this.roomid} user ${this.peerid}`)

    return this.getUserMedia(this.$refs["prevideo"], this.$mediasoup.VIDEO_CONSTRAINS[this.videoSettings]);
  },
  computed: {
    ...mapGetters([
      'getMediasoupStatus',
      'getMediasoupActivity',
      'getProfile',
      'getUser',
      'getTrigramme'
    ]),
    getMsStatusColorStatus() {
      if (this.getMediasoupStatus) {
        return "success";
      } else {
        return "error";
      }
    },
    getMsColorActivity() {
      if (this.getMediasoupActivity) {
        return "blue";
      } else {
        return "green";
      }
    }
  },

  methods: {
    ...mapMutations(['closeDrawer']),
    async changeFormat(format) {
      this.log(`Change video format ${format}`, "DEBUG");
      this.videoWidth = this.$mediasoup.VIDEO_CONSTRAINS[format].width.ideal;
      return await this.getUserMedia(this.$refs["prevideo"], this.$mediasoup.VIDEO_CONSTRAINS[format]);
    },
    toggelDrawerRoom() {
      this.drawerRoom = !this.drawerRoom
      window.sessionStorage.setItem("drawerRoom", this.drawerRoom);
    },
    cleanDevice(map) {
      return Array.from(map).map(([name, value]) => {
        return value.label
      })
    },
    async getUserMedia(videoTag, constrainsVideos = this.$mediasoup.VIDEO_CONSTRAINS.hd) {
      return navigator.mediaDevices.getUserMedia({
          video: constrainsVideos,
          audio: true,
        })
        .then(stream => {
          videoTag.srcObject = stream;
          return videoTag.play()
            .then(() => {
              return stream;
            })
            .catch(e => {
              this.log(e, "ERROR");
              throw e;
            })
        })
    },
    async acceptConnect() {
      this.dialog = false;
      this.loading = true;
      await this.connectMediasoup()
        .then((res) => {
          return this.startMediasoup()
            .then(() => {
              this.loading = false;
            })
        });
    },
    leave(event) {
      let response = null;
      switch (event.currentTarget.id) {
        case "agree":
          response = true;
          break;
        default:
          response = false;
      }
      this.log(`response : ${response}`, "DEBUG");
      this.$emit('quit', response);
    },

    quit(event) {
      return this.waitQuit(event)
        .then(() => {
          return this.$router.push({
            name: 'Rooms'
          }).catch(() => {})
        })
    },
    async waitQuit(event) {
      return new Promise((resolve, reject) => {
        this.dialogQuit = true;
        this.$once("quit", async (res) => {
          if (res) {
            try {
              await this.leaveRoom(event);
              this.dialogQuit = false;
              this.joined = false;
              return resolve(event);
            } catch (e) {
              this.log(e, "ERROR");
            }
          }
          this.dialogQuit = false;
          return reject(res)
        });
      })
    },
    connectMediasoup() {
      return this.$mediasoup.connect(this.roomid, this.peerid)
        .then(({
          room,
          peer
        }) => {
          this.log("Connect Mediasoup Server");
          this.peer = peer;
          this.room = room;
          //this.$emit('connect', room, peer);
          return {
            room,
            peer
          }
        })
    },
    async startMediasoup() {
      if (this.room) {
        if (this.room.ready) {
          return this.joinRoom();
        }
        return new Promise((resolve, reject) => {
          this.room.on("ready", () => {
            this.log(`Mediasoup room ${this.room.id} ready `);
            try {
              return resolve(this.joinRoom());
            } catch (e) {
              return reject(e);
            }
          });
        });
      }
    },
    async close() {

    },
    destroy() {
      return this.close();
    },
    isMediasoupConnected() {
      return this.getMediasoupStatus;
    },
    async getRoom(id) {
      this.log("Get rooms", "DEBUG");
      let res = await this.$mediasoup.api.http(`room/${id}`);
      let rooms = res.result;
      this.rooms.push(rooms);
      return rooms;
    },
    getPeer(peerId) {
      let Peer = this.peers.find((peer) => {
        if (peer.id === peerId) {
          return peer
        }
      });
      if (Peer) {
        return Peer;
      }
      throw new Error(`No peer found ${peerId}`);
    },
    getPeerComponent(peerId) {
      if (!this.$refs[peerId]) {
        return null;
      }
      if (this.$refs[peerId][0]) {
        return this.$refs[peerId][0];
      }
      return this.$refs[peerId];
    },
    async joinRoom() {
      this.connected = this.getMediasoupStatus;
      this.listenRoomEvents();
      return await this.room.join();
    },
    async leaveRoom(event) {
      this.peers.forEach((item) => {
        item.close();
      });
      while (this.peers.length > 0) {
        this.peers.pop();
      }
      return await this.$mediasoup.leaveRoom()
        .then((ele) => {
          this.connected = false; //this.isMediasoupConnected();
          this.peer = null;
          this.room = null;
          this.peers = [];
          return ele;
        });
    },
    listenRoomEvents() {
      this.room.on("joined", (room) => {
        this.log(`joined : ${room.id}`)
        this.joined = true;
        this.peer = room.peer;
      });
      this.room.on("ready", () => {
        this.log("room ready", "DEBUG");
      });
      this.room.on("closeRoom", () => {
        this.joined = false;
        return this.leaveRoom();
      });
      this.room.on("newPeer", (peer) => {
        this.log(`New Peer : ${peer.id}`)
        this.peers.push(peer);
      });
      this.room.on("peerClosed", (peerId) => {
        this.log(`peerClosed : ${peerId}`)
        let res = this.peers.findIndex((peer) => {
          return peer.id === peerId;
        });
        if (res !== -1) {
          this.log(`remove Peer : ${peerId}`)
          this.peers.splice(res, 1);
        }
      });
      this.room.on("addProducer", (producer) => {
        this.peer.addProducer(producer);
        return this.$refs[this.peer.id].addProducer(producer);
      });
      this.room.on("disableWebcam", (producer) => {
        this.peer.deleteProducer(producer.id);
        return this.$refs[this.peer.id].deleteProducer(producer);
      });
      this.room.on("disableShare", async (room) => {
        return await room.enableWebcam();
      });
      this.room.on("consume", (consumer, peer) => {
        this.log(`Consume event : ${peer.id}`);
        peer.addConsumer(consumer);
        // media
        let component = this.getPeerComponent(peer.id);
        return component.addConsumer(consumer);
      });
      this.room.on("consumerClosed", (consumerId, peerId) => {
        this.log(`consumerClosed : ${peerId} condumeId =${consumerId} `, "DEBUG");
        try {
          let peer = this.getPeer(peerId);
          peer.deleteConsumer(consumerId);
          this.getPeerComponent(peerId).pauseVideoTag();
        } catch (e) {
          this.log(e, "WARNING");
        }
      });
      this.room.on("consumerPaused", (consumerId) => {
        this.log(`consumerPaused  condumeid =${consumerId} `, "DEBUG");
        let consumer = null;
        let res = this.peers.find((peer) => {
          let consu = peer.hasConsumer(consumerId);
          if (consu) {
            consumer = consu;
            return peer;
          }
        });
        if (res) {
          let component = this.getPeerComponent(res.id);
          if (consumer.track.kind === "audio") {
            return component.muteTag();
          }
          if (consumer.track.kind === "video") {
            return component.pauseVideoTag();
          }
        }
      });
      this.room.on("consumerResumed", (consumerId) => {
        this.log(`consumerResumed  condumeid =${consumerId} `, "DEBUG");
        let consumer = null;
        let res = this.peers.find((peer) => {
          let consu = peer.hasConsumer(consumerId);
          if (consu) {
            consumer = consu;
            return peer;
          }
        });
        if (res) {
          let component = this.getPeerComponent(res.id);
          if (consumer.track.kind === "audio") {
            return component.demuteTag();
          }
          if (consumer.track.kind === "video") {
            return component.playVideoTag();
          }
        }
      });
    }
    //
  }
}
</script>

<style scoped lang="scss">
.overlayText {
    position: absolute;
    top: 20px;
    /*left: 5%;*/
    z-index: 1000;
}
</style>
