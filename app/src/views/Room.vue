<template>
<v-container fluid>
  <v-row v-if="connected">
    <v-col ref="room" class="d-flex flex-wrap">
      <Media v-if="peer" class="ml-5 mb-5" :isMe="true" :ref="peer.id" :room="room" :peer="peer" :key="peer.id" />
      <Media class="ml-5 mb-5" v-for=" (item) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id">
      </Media>
    </v-col>
  </v-row>
  <v-row v-if="open">
    <v-col class="d-flex flex-wrap">
      <Room :join="open" :peerId="peerid" :isAuthenticated="isAuthenticated" class="ml-5 mb-5" v-for=" (item) in rooms" :ref="item.name" :room="item" :key="item.name" v-on:connect="connect">
      </Room>
    </v-col>
  </v-row>
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
</v-container>
</template>

<script>
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';
import Media from "@/components/Media";
import Room from "@/components/Room";

export default {
  name: 'View-Room',
  components: {
    Media,
    Room
  },
  props: {
    roomid: {
      type: String,
      default: "test"
    },
    peerid: {
      type: String,
      default: "test"
    }
  },
  data(vm) {
    return {
      rooms: [],
      open: false,
      dialogQuit: false,
      room: null,
      peer: null,
      peers: [],
      connected: vm.isMediasoupConnected()
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser'
    ])
  },

  async mounted() {
    this.closeDrawer();
    if ( this.connected ) {
      this.log(`Mediasoup Server already connected ready = > ${this.$mediasoup.room.ready}`);
      return this.connect();
    } else {
      this.log("Try Connect To mediasoup server");
      await this.getRoom(this.roomid);
      this.open = true;
    }
  },

  async beforeRouteLeave(to, from, next) {
    return await this.waitQuit()
      .then(() => {
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
    ...mapGetters([
      'getMediasoupStatus'
    ]),
    async connect() {
      this.log("Connect Mediasoup Server");
      this.open = false;
      this.room = this.$mediasoup.room;
      this.peer = this.$mediasoup.peer;
      if (this.room.ready) {
         return this.joinRoom();
      }
      this.room.on("ready", (room) => {
        return this.joinRoom();
      })
    },
    async joinRoom() {
      this.connected = this.getMediasoupStatus();
      this.listenRoomEvents();
      await this.room.join();
    },
    listenRoomEvents() {
      this.room.on("joined", (peer) => {
        this.log(`joined : ${peer.id}`)
        this.peer = peer;
      });
      this.room.on("newPeer", (peer) => {
        console.log("newPeer")
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
        console.log(this.$refs)
        this.peer.addProducer(producer);
        // media
        if (this.$refs[this.peer.id][0]) {
          return this.$refs[this.peer.id][0].addProducer(producer);
        }
        return this.$refs[this.peer.id].addProducer(producer);
      });
      this.room.on("consume", (consumer, peer) => {
        console.log(this.$refs)
        peer.addConsumer(consumer);
        // media
        if (this.$refs[this.peer.id][0]) {
          return this.$refs[peer.id][0].addConsumer(consumer);
        }
        return this.$refs[this.peer.id].addConsumer(consumer);
      });
    },
    isMediasoupConnected() {
      return this.getMediasoupStatus();
    },
    getRoom(id) {
      let rooms = [{
        name: "webrtc",
        displayName: "Webrtc Meeting"
      }, {
        name: "broadcast",
        displayName: "Broadcaster Meeting",
        secure: true
      }];
      let room = null;
      rooms.forEach((item, i) => {
        if (item.name === id) {
          this.rooms.push(item);
        }
      });
    },

    async waitQuit() {
      return new Promise((resolve, reject) => {
        this.dialogQuit = true;
        this.$once("quit", async (res) => {
          if (res) {
            await this.leaveRoom();
            this.dialogQuit = false;
            return resolve(res)
          }
          this.dialogQuit = false;
          return reject(res)
        });
      })
    },
    leave() {
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
    leaveRoom() {
      return this.room.close();
    }
  }

}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
