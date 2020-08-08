<template>
<v-container ref="room" class="home" fluid>

  <Peer v-for=" (item, index) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id" class="ma-3 pa-6">
  </Peer>

  <!--dashboard :id="'dashExample'">

    <dash-layout ref="room" :key="'xl'" :breakpoint="'xl'" :numberOfCols="12">

      <Peer v-for=" (item, index) in peers" :ref="item.id" :room="room" :peer="item" :key="item.id" class="ma-3 pa-6">
     </Peer>

    </dash-layout>
  </dashboard-->

  <v-dialog v-model="dialog" persistent max-width="600">
    <v-row>
      <v-col cols="12">
        <v-row align="center" justify="center" class='home'>
          <Peer join :ref="peerElement" v-if="peer" v-on:join="agree" :room="room" :peer="peer" :videoMediaStream="stream" />
        </v-row>
      </v-col>
    </v-row>
  </v-dialog>
</v-container>
</template>

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
//import nodefony from "nodefony";
/*import {
  Dashboard,
  DashLayout,
  DashItem
} from "vue-responsive-dash";*/

import Peer from "@/components/peer";

export default {
  name: 'Home',
  components: {
    Peer,
    //Dashboard,
    //DashLayout,
    //DashItem
  },
  props: {
    roomid: {
      type: String,
      default: "test"
    },
    peerid: {
      type: String,
      default: "cci"
    }
  },
  data(vm) {
    return {
      dlayouts: [{
        breakpoint: "xl",
        numberOfCols: 12,
        items: [{
          id: "1",
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }, {
          id: "2",
          x: 1,
          y: 0,
          width: 2,
          height: 1
        }, ]
      }, {
        breakpoint: "lg",
        breakpointWidth: 1200,
        numberOfCols: 10,
        items: [{
          id: "1",
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }, {
          id: "2",
          x: 1,
          y: 0,
          width: 2,
          height: 1
        }]
      }, {
        breakpoint: "md",
        breakpointWidth: 996,
        numberOfCols: 8,
        items: [{
          id: "1",
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }, {
          id: "2",
          x: 1,
          y: 0,
          width: 2,
          height: 1
        }, ]
      }, {
        breakpoint: "sm",
        breakpointWidth: 768,
        numberOfCols: 4,
        items: [{
          id: "1",
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }, {
          id: "2",
          x: 1,
          y: 0,
          width: 2,
          height: 1
        }, ]
      }, {
        breakpoint: "xs",
        breakpointWidth: 480,
        numberOfCols: 2,
        items: [{
          id: "1",
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }, {
          id: "2",
          x: 1,
          y: 0,
          width: 1,
          height: 1
        }, ]
      }, {
        breakpoint: "xxs",
        breakpointWidth: 0,
        numberOfCols: 1,
        items: [{
          id: "1",
          x: 0,
          y: 0,
          width: 1,
          height: 1
        }, {
          id: "2",
          x: 0,
          y: 1,
          width: 1,
          height: 1
        }]
      }],
      peers: [],
      dialog: false,
      stream: null,
      room: null,
      peer: null,
      peerElement: "me"
    }
  },
  computed: {},
  /*mounted() {
    console.log("mounted  ")
    console.log(this.peer, this.room)
    console.log(this.peer.videoElement)
    this.room.mediaStream.mediaElement = this.peer.videoElement;
  },*/
  async mounted() {
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
        });
        this.room.on("newPeer", (peer) => {
          this.peers.push(peer);
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

.content {
  height: 100%;
  width: 100%;
  border: 2px solid #42b983;
  border-radius: 5px;
}

.video {
  width: 100%;
  height: 100%;
}

.video {
  width: 300px;
  height: 300px;
}

.mycard {
  background-color: rgb(27, 38, 56, 0) !important;
}

.mycolor {
  color: rgb(120, 255, 255, 1) !important;
}
</style>
