<template>
<v-container fluid fill-height class="ma-0 pa-0">

  <v-container v-show="joined" fluid fill-height class="pa-0 ma-0">

    <v-flex fill-height>
      <room-tool-bar-top :roomid="roomid" v-on:quit="quit" v-on:layoutchange="selectLayout" />

      <!--room-grid-layout v-show="grid" :layout="grid" ref="grid" />

      <room-focus-layout v-show="focus" :layout="focus" ref="focus" /-->

      <meeting-layout ref="layout" />


      <room-side-bar />
      <!--room-tool-bar-bottom v-on:quit="quit" /-->


      <room-quit-meeting v-if="dialogQuit" :roomid="room.id" v-on:response="leave" />
    </v-flex>
  </v-container>

</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';

import DialogQuit from '@/components/meetings/RoomDialogQuit';
import RoomToolBarTop from '@/components/meetings/nav/RoomToolBarTop';
import RoomSideBar from '@/components/meetings/nav/sidebar/RoomSideBar';
import MettingLayout from '@/components/meetings/layouts/MeetingLayout.vue';

export default {
  name: 'Meeting',
  components: {
    "room-quit-meeting": DialogQuit,
    "room-tool-bar-top": RoomToolBarTop,
    "room-side-bar": RoomSideBar,
    "meeting-layout": MettingLayout
  },
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {
      message: null,
      intevalTime: null,
      grid: false,
      focus: false,
      joined: false,
      connected: false
    }
  },
  async beforeRouteEnter(to, from, next) {
    /*if (to.name === from.name) {
      return next((vm) => {
        return vm.redirect()
      });
    }*/
    return next();
  },
  beforeRouteLeave(to, from, next) {
    //console.log("passs beforeRouteLeave ")
    //this.openDrawer();
    //console.log(to.name, to.name)
    this.openNavBar();
    return next();
    /*return this.close()
      .then(() => {
        this.openNavBar();
        return next();
      });*/
  },
  //beforeMount() {
  async beforeCreate() {},
  async created() {},
  mounted() {
    //console.trace("passss mount meeting")
    this.closeDrawer();
    this.closeNavBar();
    //this.openJoinDialog();
    /*if (!this.getRoomEntity) {
      return;
    }*/
    return this.acceptConnect();
  },
  watch: {
    message(message) {
      this.notify(message);
    }
  },
  async beforeDestroy() {
    //console.log("passs beforeDestroy ")
    this.deleteVideoStream();
    this.deleteAudioStream();
    return await this.leaveRoom();
  },
  async destroyed() {
    //console.log("passs destroyed ")
    if (this.intevalTime) {
      clearInterval(this.intevalTime);
    }
    this.room = null;
    this.peer = null;
  },
  beforeUpdate() {},

  computed: {
    ...mapGetters({
      clock: 'getClock',
      peerid: 'getProfileUsername',
      chatMessages: 'getChatMessages'
    }),
    ...mapGetters([
      "isAuthenticated",
      //'getProfileUsername',
      'getRoomEntity',
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
      'dialogQuit',
      'getSideBar'
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
      'setMedia',
      'setChatMessage'
    ]),

    // mediasoup
    async acceptConnect() {
      this.loading = true;
      return await this.initializeRoom()
        .then(() => {
          return this.start()
            .then(() => {
              this.loading = false;
              return;
            })
        })
        .catch(e => {
          this.log(e, "ERROR");
        });
    },

    initializeRoom(options) {
      return this.$mediasoup.initializeRoom(this.roomid, this.peerid, options)
        .then(({
          room,
          peer
        }) => {
          this.log("initialize Mediasoup Room");
          this.peer = peer;
          this.peer.local = true;
          this.room = room;
          return {
            room,
            peer
          }
        });
    },

    async start() {
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
      this.connected = this.getMediasoupStatus;
      this.listenRoomEvents();
      return await this.room.join();
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
        if (producer.type === "share") {
          let component = this.getPeerComponent("share");
          await component.addProducer(producer);
          this.getLayout().displayShare(this.peer, producer);
        } else {
          let component = this.getPeerComponent(this.peer.id);
          this.peer.addProducer(producer);
          await component.addProducer(producer);
          this.getLayout().focusPeer(this.peer.id, 0);
        }
      });
      this.room.on("disableWebcam", (producer) => {
        let component = this.getPeerComponent(this.peer.id);
        this.peer.deleteProducer(producer.id);
        return component.deleteProducer(producer);
      });
      this.room.on("disableShare", async (room) => {
        //await room.enableWebcam();
        this.deleteMedias("screen");
        this.getLayout().stopDisplayShare();
      });
      this.room.on("consume", async (consumer, peer) => {
        this.log(`Consume event : ${peer.id}`);
        peer.addConsumer(consumer);
        // media
        if (consumer.appData.share) {
          let component = this.getPeerComponent("share");
          await component.addConsumer(consumer);
          this.getLayout().displayShare(peer, consumer);
        } else {
          let component = this.getPeerComponent(peer.id);
          await component.addConsumer(consumer);
        }
      });
      this.room.on("consumerClosed", async (consumerId, peerId, appData) => {
        this.log(`consumerClosed : ${peerId} condumeId =${consumerId} `, "DEBUG");
        try {
          if (appData.share) {
            this.getLayout().stopDisplayShare();
          }
          let peer = this.getRemotePeer(peerId);
          if (peer) {
            let consumer = peer.hasConsumer(consumerId);
            if (consumer) {
              let component = this.getPeerComponent(peerId);
              await component.deleteConsumer(consumer);
              peer.deleteConsumer(consumerId);
            }
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
      this.room.on("onDataConsumerMessage", (message) => {
        this.setChatMessage(message);
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
      if (!layout) {
        layout = this.$refs.layout;
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

    close() {
      return this.redirect();
    },

    redirect() {
      return this.$router.replace({
          name: 'HomeMeeting',
          params: {
            roomid: this.roomid
          },
          force: true
        })
        .then(() => {
          return this.leaveRoom();
        })
        .catch(() => {
          return this.leaveRoom();
        })
    },
    async leaveRoom() {
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
