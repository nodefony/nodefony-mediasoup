<template>
<v-container fluid fill-height class="ma-0 pa-0">

  <room-home-meeting v-if="home" :roomid="roomid" v-on:connect="joining= true;home=false" />

  <room-join-meeting v-if="joining" :roomid="roomid" v-on:join="acceptConnect" v-on:close="closeDialogJoin" />

  <v-container v-show="joined" fluid fill-height class="pa-0 ma-0">

    <v-flex fill-height>

      <room-tool-bar-top v-on:layoutchange="selectLayout" :roomid="roomid" />

      <room-grid-layout v-show="grid" :layout="grid" ref="grid" />

      <room-focus-layout v-show="focus" :layout="focus" ref="focus" />

      <room-tool-bar-bottom v-on:quit="quit" />
    </v-flex>

  </v-container>

  <!--v-row v-show="joined" class="pa-0 ma-0">
    <v-col cols="3" class="pa-0 ma-0">
      <room-side-bar :peers="peers" />
    </v-col>
    <room-tool-bar-bottom v-on:quit="quit" />
  </v-row-->

  <room-quit-meeting v-if="dialogQuit" :roomid="room.id" v-on:response="leave" />

</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import HomeMeeting from '@/views/meetings/HomeMeeting';
import DialogJoin from '../../components/meetings/RoomDialogJoin';
import DialogQuit from '../../components/meetings/RoomDialogQuit';
import RoomToolBarTop from '../../components/meetings/nav/RoomToolBarTop';
import RoomToolBarBottom from '../../components/meetings/nav/RoomToolBarBottom';
import RoomSideBar from '../../components/meetings/nav/sidebar/RoomSideBar';
import RoomFocusLayout from '../../components/meetings/layouts/RoomFocusLayout';
import RoomGrilleLayout from '../../components/meetings/layouts/RoomGridLayout';

export default {
  name: 'Layout',
  components: {
    "room-home-meeting": HomeMeeting,
    "room-join-meeting": DialogJoin,
    "room-quit-meeting": DialogQuit,
    "room-tool-bar-top": RoomToolBarTop,
    "room-tool-bar-bottom": RoomToolBarBottom,
    "room-side-bar": RoomSideBar,
    "room-focus-layout": RoomFocusLayout,
    "room-grid-layout": RoomGrilleLayout,
  },
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {
      home: true,
      joining: false,
      peerid: null,
      intevalTime: null,
      grid: false,
      focus: true,
      joined: false,
      connected: false
    }
  },
  beforeRouteLeave(to, from, next) {
    //this.openDrawer();
    this.openNavBar();
    return next()
  },
  mounted() {
    this.closeDrawer();
    this.closeNavBar();
    if (!this.home) {
      return this.openJoinDialog();
    }
    if (this.home && !this.isAuthenticated) {
      //
    }
    if (this.joining && this.isAuthenticated) {
      //
    }


    /*this.intevalTime = setInterval(() => {
      //this.setClock();
    }, 1000);*/
  },
  beforeDestroy() {
    this.deleteVideoStream();
    this.deleteAudioStream();
    this.room = null;
    this.peer = null;
  },
  destroyed() {
    this.log(`destroyed room component`);
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
    }),
    ...mapGetters([
      "isAuthenticated",
      'getRoom',
      'getPeer',
      'peers',
      'webcam',
      'microphone',
      'getRemotePeer',
      'microphone',
      'audioStream',
      'videoStream',
      'getMediasoupStatus',
      'getMediasoupActivity',
      'getUser',
      'dialogQuit'
    ]),
    room: {
      get() {
        return this.getRoom;
      },
      set(value) {
        return this.setRoom(value)
      }
    },
    peer: {
      get() {
        return this.getPeer;
      },
      set(value) {
        return this.setPeer(value)
      }
    },
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
    ...mapGetters([]),
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
      'addRemotePeer',
      'removePeer',
      'removeAllPeers',
      'deleteVideoStream',
      'deleteAudioStream',
      'setRoom',
      'setPeer',
      'deleteMedias',
      'setMedia'
    ]),
    close() {
      //this.$destroy();
      return this.redirect();
    },
    // mediasoup
    async acceptConnect() {
      this.loading = true;
      await this.connectMediasoup()
        .then(() => {
          return this.startMediasoup()
            .then(() => {
              this.loading = false;
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
          this.peer.local = true;
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
      this.closeJoinDialog();
      this.connected = this.getMediasoupStatus;
      this.listenRoomEvents();
      return await this.room.join();
    },

    async leaveRoom(event) {
      this.peers.forEach((item) => {
        item.close();
      });
      this.removeAllPeers();
      return await this.$mediasoup.leaveRoom()
        .then((ele) => {
          this.connected = false;
          this.peer = null;
          this.room = null;
          return ele;
        });
    },

    listenRoomEvents() {
      this.room.on("joined", async (options, room) => {
        this.log(options, "DEBUG");
        try {
          this.peer = room.peer;
          await room.enableMic(this.audioStream, this.microphone);
          await room.enableWebcam(this.videoStream, /*this.webcam*/ );
          this.log(`joined : ${room.id}`)
          this.joined = true;
        } catch (e) {
          this.log(e, "ERROR");
          throw e;
        }
      });
      this.room.on("closeSock", () => {
        this.removeAllPeers();
        this.peer = null;
        this.room = null;
        this.connected = false;
      });
      this.room.on("ready", () => {
        this.log("room ready", "DEBUG");
      });
      this.room.on("closeRoom", () => {
        this.joined = false;
        return this.leaveRoom();
      });
      this.room.on("disableMicrophone", async () => {
        this.log(`event disableMicrophone`)
        this.deleteMedias("audio");
        // event try enable new default microphone
        await this.room.enableMic();
        this.setMedia("audio");
      });
      this.room.on("activeSpeaker", (peerId, volume) => {
        this.log(`${peerId} volume : ${volume}`, "DEBUG");
        let component = this.getPeerComponent(peerId);
        if (component) {
          component.volume = volume || -100;
        }
        //if (volume > -20) {
        this.getLayout().focusPeer(peerId, volume);
        //}
      });
      this.room.on("newPeer", (peer) => {
        this.log(`New Peer : ${peer.id}`);
        this.addRemotePeer(peer);
      });
      this.room.on("peerClosed", (peerId) => {
        this.log(`peerClosed : ${peerId}`)
        this.removePeer(peerId);
      });
      this.room.on("addProducer", async (producer) => {
        this.log(`addProducer => ${producer.type}`, "DEBUG");
        let component = this.getPeerComponent(this.peer.id);
        this.peer.addProducer(producer);
        await component.addProducer(producer);
        if (producer.type === "share") {
          this.getLayout().displayShare(this.peer);
        } else {
          this.getLayout().focusPeer(this.peer.id, 0);
        }
      });
      this.room.on("disableWebcam", (producer) => {
        let component = this.getPeerComponent(this.peer.id);
        this.peer.deleteProducer(producer.id);
        return component.deleteProducer(producer);
      });
      this.room.on("disableShare", async (room) => {
        await room.enableWebcam();
        this.deleteMedias("screen");
      });
      this.room.on("consume", async (consumer, peer) => {
        this.log(`Consume event : ${peer.id}`);
        peer.addConsumer(consumer);
        // media
        let component = this.getPeerComponent(peer.id);
        await component.addConsumer(consumer);
        if (consumer.appData.share) {
          this.getLayout().displayShare(peer)
        }
      });
      this.room.on("consumerClosed", (consumerId, peerId, appData) => {
        this.log(`consumerClosed : ${peerId} condumeId =${consumerId} `, "DEBUG");
        try {
          let peer = this.getRemotePeer(peerId);
          if (peer) {
            peer.deleteConsumer(consumerId);
          }
          if (appData.share) {
            this.getLayout().stopDisplayShare(peer)
          }
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

    getLayout() {
      let layout = null
      if (this.grid) {
        layout = this.$refs.grid;
      }
      if (this.focus) {
        layout = this.$refs.focus;
      }
      return layout;
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
    getPeerComponent(peerId) {
      let layout = this.getLayout();
      if (!layout) {
        return null;
      }
      let ref = layout.$refs;
      if (ref[peerId][0]) {
        return ref[peerId][0];
      }
      return ref[peerId];
    },

    // application
    closeDialogJoin() {
      this.close();
    },
    quit(event) {
      this.openQuitDialog();
      return this.waitQuit(event)
        .then(() => {
          return this.close();
        })
        .catch(() => {
          this.log(`Abort Quit`);
        })
    },
    redirect() {
      this.home = true;
      return this.$router.push({
          name: 'Meeting',
          params: {
            roomid: this.roomid
          }
        }).then(() => {

        })
        .catch(() => {})
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
