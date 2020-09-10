<template>
<v-container fluid>
  <v-row v-if="connected">
    <v-col ref="room" class="d-flex flex-wrap">
      <Media class="ml-5 mb-5" v-for=" (item) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id">
      </Media>
    </v-col>
  </v-row>
  <v-row v-else>
    <v-col class="d-flex flex-wrap ">
      <Room class="ml-5 mb-5" v-for=" (item) in rooms" :ref="item.name" :room="item" :peerId="peerid" :key="item.name" v-on:connect="connect">
      </Room>
    </v-col>
  </v-row>
  <v-dialog v-model="dialog" persistent max-width="600">
    <Media v-if="peer" class="ml-5 mb-5" key="me" :isMe="true" join :ref="peerElement" v-on:join="null" :room="room" :peer="peer" :roomid="roomId" :peerid="peerId" />
  </v-dialog>
  <v-dialog v-model="dialogQuit" persistent max-width="600">
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
                  <span class="white--text headline">{{room}}</span>
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
import Media from "@/components/Media";
import Room from "@/components/Room";
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';

export default {
  name: 'Rooms',
  components: {
    Media,
    Room
  },
  props: {
    roomid: {
      type: String,
      default: "test"
    }
  },
  data(vm) {
    return {
      peers: [],
      peerid: null,
      dialog: false,
      dialogQuit: false,
      stream: null,
      room: null,
      rooms: [{
        name: "test"
      }, {
        name: "test2",
        secure: true
      }],
      peer: null,
      peerElement: "me",
      accept: false,
      connected: false
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
    this.stream = null;
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser'
    ])
  },

  async mounted() {
    if (this.isAuthenticated) {
      this.peerid = this.getUser;
    }
    //await this.connect();
    return Promise.resolve(true);
  },
  /*async created() {},*/
  methods: {
    ...mapMutations(['closeDrawer']),
    async agree(response) {
      if (response) {
        this.log("agree", "DEBUG");
        await this.room.join()
        this.dialog = false;
        this.accept = true;
        return;
      }
      this.accept = false;
      this.dialog = false;
      this.log("disagree")
    },
    async join(peer) {
      this.accept = true;
      this.closeDrawer();
    },
    async connect(room, peer, node) {
      console.log(connect)
      this.room = room;
      this.peer = peer;
      this.connected = true;

      this.peerElement = this.peer.id;
      this.room.on("joined", (peer) => {
        this.$refs["room"].prepend(node);
        //this.closeDrawer();
        this.join(peer);
      });
      this.room.on("newPeer", (peer) => {
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
        this.$refs[this.peer.id].addProducer(producer);
      });
      this.room.on("consume", (consumer, peer) => {
        peer.addConsumer(consumer);
        this.$refs[peer.id][0].addConsumer(consumer);
      });
      /*return await this.$mediasoup.connect(this.roomid, this.peerid)
        .then(({
          room,
          peer
        }) => {
          this.dialog = true;
          this.peer = peer;
          this.peerElement = this.peer.id;
          this.room = room;
          //this.peers = this.room.peers;
          this.room.on("joined", (peer) => {
            this.$refs["room"].prepend(this.$refs[this.peerElement].$el);
            this.closeDrawer();
          });
          this.room.on("newPeer", (peer) => {
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
            this.$refs[this.peer.id].addProducer(producer);
          });
          this.room.on("consume", (consumer, peer) => {
            peer.addConsumer(consumer);
            this.$refs[peer.id][0].addConsumer(consumer);
          });
        })
        .catch((e) => {
          this.log(e);
        });*/
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
.home {
  width: 100%;
  height: 100%;
  background-color: rgb(27, 38, 56);
  padding: 0px;
  margin: 0px;
}
</style>
