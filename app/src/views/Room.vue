<template>
<v-app id="room">
  <v-main class="pa-0">
    <v-container v-if="connected" class="fill-height" fluid>
      <v-app-bar app clipped-left>
        <v-app-bar-nav-icon @click.stop="navigation.drawer = !navigation.drawer">
        </v-app-bar-nav-icon>
        <v-toolbar-title>Room {{room.id}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn class="ma-2" outlined color="indigo" @click="waitQuit">Quit Room</v-btn>
        <v-spacer></v-spacer>
        <div>
          <v-chip class="ma-2" :color="getSpStatusColorStatus" outlined>
            <v-icon :color="getSpColorActivity" left>mdi-server-plus</v-icon>
            SIP Status
          </v-chip>
          <v-chip class="ma-2" :color="getMsStatusColorStatus" outlined>
            <v-icon left :color="getMsColorActivity">mdi-server-plus</v-icon>
            Mediasoup Status
          </v-chip>
        </div>
        <v-btn icon>
          <v-icon>mdi-bell</v-icon>
        </v-btn>
      </v-app-bar>

      <v-navigation-drawer :width="navigation.width" v-model="navigation.drawer" app clipped>
        <v-tabs>
          <v-tab key="user">
            {{peer.id}}
          </v-tab>
          <v-tab key="message">
            Messages
          </v-tab>
          <v-tab key="stats">
            Stats
          </v-tab>
          <v-tab-item style="left:0px;top:5px" key="user">
            <Media max-width="100%" v-show="peer && joined" :name="peer.id" class="mt-5" :isMe="true" :ref="peer.id" :room="room" :peer="peer" :key="peer.id" v-on:close="quit" />
          </v-tab-item>
          <v-tab-item key="message">
            <v-card-text>Content for tab message would go here</v-card-text>
            <Message />

          </v-tab-item>
          <v-tab-item key="stats">
            <v-card-text>Content for tab stats would go here</v-card-text>
          </v-tab-item>
        </v-tabs>

      </v-navigation-drawer>

      <v-col cols="12">
        <v-row v-show='! peers.length' style="height: 600px;" align="center" justify="center">
          <v-container style="height: 400px;">
            <v-row class="fill-height" align-content="center" justify="center">
              <v-col class="subtitle-1 text-center" cols="12">
                Waiting Meeting Participants
              </v-col>
              <v-col cols="6">
                <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
              </v-col>
            </v-row>
          </v-container>
        </v-row>
        <v-row v-show="peers.length" ref="room" style="height: 600px;" align="start" justify="space-around">
          <Media class="ml-5 mb-5" v-for=" (item) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id" :name="item.id">
          </Media>
        </v-row>
      </v-col>
    </v-container>

    <v-container v-else class="fill-height" fluid>
      <v-row style="height: 600px;" align="start" justify="space-around">
        <Room :join="open" :peerId="peerid" :isAuthenticated="isAuthenticated" class="ml-5 mb-5" v-for=" (item) in rooms" :ref="item.name" :room="item" :key="item.name" v-on:connect="connect">
        </Room>
      </v-row>
    </v-container>
  </v-main>
  <v-dialog v-if="room" v-model="dialogQuit" persistent max-width="600">
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
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';
import Media from "@/components/Media";
import Room from "@/components/Room";
import Message from "@/components/Message";

export default {
  name: 'View-Room',
  components: {
    Media,
    Room,
    Message
  },
  props: {
    roomid: {
      type: String,
      default: "test"
    },
    peerid: {
      type: String
    }
  },
  data(vm) {
    return {
      navigation: {
        drawer: true,
        width: 400
      },
      rooms: [],
      open: vm.peerid ? true : false,
      joined: false,
      dialogQuit: false,
      room: null,
      peer: null,
      peers: [],
      connected: vm.isMediasoupConnected()
    }
  },
  async mounted() {
    this.closeDrawer();
    if (this.connected) {
      this.open = false;
      this.log(`Mediasoup Server already connected ready = > ${this.$mediasoup.room.ready}`);
      return this.connect();
    } else {
      this.log(`Try Connect To mediasoup server open dialog =>${this.open}`);
      return await this.getRoom(this.roomid)
        .then((res) => {
          if (this.open) {
            return res;
          }
          return this.connect();
        });
    }
  },
  watch: {
    $route(to, from) {
      this.log(`Watcher router`);
      this.log(to)
      this.log(from)
      //this.leaveRoom();
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getMediasoupStatus',
      'getMediasoupActivity',
      'getSipStatus',
      'getSipActivity'
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
    },
    getSpStatusColorStatus() {
      if (this.getSipStatus) {
        return "success";
      } else {
        return "error";
      }
    },
    getSpColorActivity() {
      if (this.getSipActivity) {
        return "blue";
      } else {
        return "black";
      }
    }
  },

  async beforeRouteLeave(to, from, next) {
    return await this.waitQuit()
      .then(() => {
        this.log(`Quit room ${to.name} => ${from.name}`);
        return next();
      })
      .catch(e => {
        throw e
      });
  },
  destroyed() {
    this.peer = null;
    this.room = null;
  },
  methods: {
    ...mapMutations(['closeDrawer']),
    ...mapActions(["API_REQUEST"]),
    async connect() {
      this.log("Connect Mediasoup Server");
      this.open = false;
      this.room = this.$mediasoup.room;
      this.peer = this.$mediasoup.peer;
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
    },
    async joinRoom() {
      this.connected = this.getMediasoupStatus;
      this.listenRoomEvents();
      return await this.room.join();
    },
    listenRoomEvents() {
      this.room.on("joined", (room) => {
        this.log(`joined : ${room.id}`)
        this.joined = true;
        this.peer = room.peer;
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
      this.room.on("consume", (consumer, peer) => {
        this.log(`Consume event : ${peer.id}`);
        peer.addConsumer(consumer);
        // media
        if (this.$refs[peer.id] && this.$refs[peer.id][0]) {
          return this.$refs[peer.id][0].addConsumer(consumer);
        }
        return this.$refs[peer.id].addConsumer(consumer);
      });
    },
    isMediasoupConnected() {
      return this.getMediasoupStatus;
    },
    async getRoom(id) {
      let res = await this.API_REQUEST("/room/api", "GET");
      let rooms = res.result.rows;
      rooms.forEach((item) => {
        if (item.name === id) {
          this.rooms.push(item);
        }
      });
      return rooms;
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
    quit(event) {
      return this.waitQuit(event)
      /*return this.$router.push({
        name: 'MettingRoom',
        params: {
          roomid: this.room.id
        }
      })*/
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  max-width: 100vw;
  padding: 0px;
}
</style>
