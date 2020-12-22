<template>
<v-container fluid class="ma-0 pa-0">

  <room-dialog-join :roomid="roomid" v-on:join="acceptConnect" v-on:close="closeDialogJoin" />
  <!--room-system-bar /-->
  <room-tool-bar-top v-on:layoutchange="selectLayout" />

  <v-row v-if="joined" style="margin:23px 0 23px 0">
    <v-col cols="9" class="pa-0 ma-0">
      <room-focus-layout v-show="focus" :layout="focus" ref="focus" />
      <room-grid-layout v-show="grid" :layout="grid" ref="grid" />
    </v-col>
    <v-col cols="3" class="pa-0 ma-0">
      <room-side-bar :peers="peers" />
    </v-col>
    <room-tool-bar-bottom v-on:quit="quit" />
  </v-row>

  <room-dialog-quit v-if="dialogQuit" :roomid="room.id" v-on:response="leave" />

</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import DialogJoin from '../../components/room/RoomDialogJoin';
import DialogQuit from '../../components/room/RoomDialogQuit';
import RoomSystemBar from '../../components/room/nav/RoomSystemBar';
import RoomToolBarTop from '../../components/room/nav/RoomToolBarTop';
import RoomToolBarBottom from '../../components/room/nav/RoomToolBarBottom';
import RoomSideBar from '../../components/room/nav/sidebar/RoomSideBar';
import RoomFocusLayout from '../../components/room/layouts/RoomFocusLayout';
import RoomGrilleLayout from '../../components/room/layouts/RoomGrilleLayout';

export default {
  name: 'Layout',
  components: {
    "room-dialog-join": DialogJoin,
    "room-dialog-quit": DialogQuit,
    "room-system-bar": RoomSystemBar,
    "room-tool-bar-top": RoomToolBarTop,
    "room-tool-bar-bottom": RoomToolBarBottom,
    "room-side-bar": RoomSideBar,
    "room-focus-layout": RoomFocusLayout,
    "room-grid-layout": RoomGrilleLayout,
  },
  data(vm) {
    return {
      peer: null,
      peerid: null,
      room: null,
      roomid: "webrtc",
      intevalTime: null,
      grid: false,
      focus: true,
      joined: false,
      connected: false
    }
  },
  beforeRouteLeave() {
    this.openDrawer();
    this.openNavBar();
  },
  mounted() {
    this.openJoinDialog();
    this.closeDrawer();
    this.closeNavBar();
    this.intevalTime = setInterval(() => {
      //this.setClock();
    }, 1000);
  },
  beforeDestroy() {

  },
  destroyed() {
    this.log(`destroyed room component`);
    this.peer = null;
    this.room = null;
    this.deleteVideoStream();
    this.deleteAudioStream();
    if (this.intevalTime) {
      clearInterval(this.intevalTime);
    }
  },
  //beforeMount() {
  async beforeCreate() {},
  async created() {
    this.peerid = this.getUser;
    this.log(this.peerid, "DEBUG");

  },
  computed: {
    ...mapGetters({
      clock: 'getClock',
      audioStream: 'audioStream',
      videoStream: 'videoStream',
      peers: 'peers',

    }),
    ...mapGetters([
      'getMediasoupStatus',
      'getMediasoupActivity',
      'getUser',
      'dialogQuit'
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
    ...mapGetters([
      'getPeer'
    ]),
    ...mapMutations([
      'openJoinDialog',
      'closeJoinDialog',
      'openQuitDialog',
      'closeQuitDialog',
      'closeDrawer',
      'openDrawer',
      'openNavBar',
      'closeNavBar',
      'setClock',
      'addPeer',
      'removePeer',
      'removeAllPeers',
      'deleteVideoStream',
      'deleteAudioStream'
    ]),

    // mediasoup
    async acceptConnect() {
      this.loading = true;
      await this.connectMediasoup()
        .then(() => {
          return this.startMediasoup()
            .then(() => {
              this.loading = false;
              //this.peers.push(this.peer);
              this.addPeer(this.peer)
              return;
            })
        })
        .catch(e => {
          this.log(e, "ERROR");
        });
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
          this.$emit('connect', room, peer);
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

    async joinRoom() {
      this.joined = true;
      this.closeJoinDialog();
      this.connected = this.getMediasoupStatus;
      this.listenRoomEvents();
      return await this.room.join();
    },

    async leaveRoom(event) {
      this.peers.forEach((item) => {
        item.close();
      });
      /*while (this.peers.length > 0) {
        this.peers.pop();
      }*/
      this.removeAllPeers();
      return await this.$mediasoup.leaveRoom()
        .then((ele) => {
          this.connected = false; //this.isMediasoupConnected();
          this.peer = null;
          this.room = null;
          //this.peers = [];
          return ele;
        });
    },

    listenRoomEvents() {
      this.room.on("joined", async (options, room) => {
        this.log(`joined : ${room.id}`)
        this.log(options, "DEBUG");
        this.joined = true;
        this.peer = room.peer;
        try {
          await room.enableMic(this.audioStream);
          await room.enableWebcam(this.videoStream);
        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }
      });
      this.room.on("ready", () => {
        this.log("room ready", "DEBUG");
      });
      this.room.on("closeRoom", () => {
        this.joined = false;
        return this.leaveRoom();
      });
      this.room.on("newPeer", (peer) => {
        this.log(`New Peer : ${peer.id}`);
        this.addPeer(peer);
        //this.peers.push(peer);
      });
      this.room.on("peerClosed", (peerId) => {
        this.log(`peerClosed : ${peerId}`)
        //let peer = this.getPeer(peerId);
        this.removePeer(peerId);

        /*let res = this.peers.findIndex((peer) => {
          return peer.id === peerId;
        });
        if (res !== -1) {
          this.log(`remove Peer : ${peerId}`)
          this.peers.splice(res, 1);
        }*/
      });
      this.room.on("addProducer", (producer) => {
        let component = this.getPeerComponent(this.peer.id);
        this.peer.addProducer(producer);
        return component.addProducer(producer);
      });
      this.room.on("disableWebcam", (producer) => {
        let component = this.getPeerComponent(this.peer.id);
        this.peer.deleteProducer(producer.id);
        return component.deleteProducer(producer);
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
    },

    getPeerComponent(peerId) {
      let layout = null
      if (this.$refs.grid) {
        layout = this.$refs.grid.$refs;
      }
      if (this.$refs.focus) {
        layout = this.$refs.focus.$refs;
      }
      if (!layout) {
        return null;
      }
      if (layout[peerId][0]) {
        return layout[peerId][0];
      }
      return layout[peerId];
    },

    // application
    closeDialogJoin() {
      this.$destroy();
      //return this.redirect();
    },

    selectLayout(selectedLayout) {
      this.grid = false;
      this.focus = false;
      switch (selectedLayout) {
        case 0:
          this.grid = true;
          break;
        case 1:
          this.focus = true;
          break;
        default:
          this.grid = true;
      }
    },

    quit(event) {
      this.openQuitDialog();
      return this.waitQuit(event)
        .then(() => {
          return this.redirect();
        })
        .catch(() => {
          this.log(`Abort Quit`);
        })
    },
    redirect() {
      return this.$router.push({
        name: 'Rooms'
      }).catch(() => {})
    },
    leave(res) {
      this.$emit("quit", res);
    },
    async waitQuit(event) {
      return new Promise((resolve, reject) => {
        this.$once("quit", async (res) => {
          if (res) {
            try {
              await this.leaveRoom(event);
              this.joined = false;
              return resolve(event);
            } catch (e) {
              this.log(e, "ERROR");
            }
          }
          return reject(res)
        });
      })
    }
  }

}
</script>

<style scoped>
footer {
  position: fixed;
  z-index: 1000;
  width: 100%;
  bottom: 0px;
}
</style>
