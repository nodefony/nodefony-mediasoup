<template>
<v-container fluid>
  <v-row class="">
    <v-col ref="room" class="d-flex flex-wrap align-content-center">
      <Peer class="" max-width="300" max-height="300" v-for=" (item, index) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id">
      </Peer>
    </v-col>
  </v-row>
  <v-dialog v-model="dialog" persistent max-width="600">
    <Peer key="me" :isMe="true" join :ref="peerElement" v-if="peer" v-on:join="agree" :room="room" :peer="peer" :videoMediaStream="stream" max-height="300" />
  </v-dialog>
</v-container>
</template>

<script>
import Peer from "@/components/peer";
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';

export default {
  name: 'Home',
  components: {
    Peer
  },
  props: {
    roomid: {
      type: String,
      default: "test"
    },
    peerid: {
      type: String,
      default: ""
    }
  },
  data(vm) {
    return {
      peers: [],
      dialog: false,
      stream: null,
      room: null,
      peer: null,
      peerElement: "me"
    }
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
    return await this.$mediasoup.connect(this.roomid, this.peerid)
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
      });
  },
  /*async created() {

  },*/
  methods: {
    ...mapMutations(['closeDrawer']),
    async agree(response) {
      if (response) {
        this.log("agree", "DEBUG");
        await this.room.join()
        this.dialog = false;
        return;
      }
      this.dialog = false;
      this.log("disagree")
    },
    async addStream() {
      if (this.stream && this.room) {
        return await this.room.mediaStream.reattachMediaStream(this.stream, this.$refs["video"])
      }
      return null;
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
