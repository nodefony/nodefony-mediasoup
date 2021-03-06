<template>
<v-container v-if="ready" fluid class="ma-0 pa-0">

  <room-tool-bar-top :roomid="roomid" v-on:quit="quit" v-on:layoutchange="selectLayout" />

  <!--meeting-layout v-show="joined"  ref="layout" /-->

  <meeting-layout v-if="focus" :layout="focus" ref="focus" />

  <grid-layout v-if=" grid" :layout="grid" ref="grid" />

  <room-side-bar />

  <room-quit-meeting v-if="dialogQuit" :roomid="room.id" v-on:response="leave" />

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
import GridLayout from '@/components/meetings/layouts/GridLayout';

export default {
  name: 'Meeting',
  components: {
    "room-quit-meeting": DialogQuit,
    "room-tool-bar-top": RoomToolBarTop,
    "room-side-bar": RoomSideBar,
    "meeting-layout": MettingLayout,
    "grid-layout": GridLayout
  },
  props: {
    roomid: {
      type: String
    }
  },
  data() {
    return {
      message: null,
      intevalTime: null,
      grid: false,
      focus: true,
      joined: false,
      connected: false,
      ready: false
    }
  },

  async beforeRouteEnter(to, from, next) {
    return next();
  },
  beforeRouteLeave(to, from, next) {
    this.openNavBar();
    return next(async () => {
      return await this.leaveRoom();
    });
  },

  async beforeCreate() {},
  async created() {},
  beforeMount() {
    if (!this.getMediasoupStatus) {
      return this.$router.replace({
        name: "HomeMeeting",
        params: {
          roomid: this.roomid
        }
      });
    }
  },
  mounted() {
    if (!this.getMediasoupStatus) {
      return this.$destroy();
    }
    this.ready = true;
    //console.trace("passss mount meeting")
    this.closeDrawer();
    this.closeNavBar();
    this.$mediasoup.once("closeSock", this.sockClose);
    return this.acceptConnect();
  },
  watch: {
    message(message) {
      if (message) {
        this.notify(message);
      }
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
    this.$mediasoup.removeListener("closeSock", this.sockClose);
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
      'hasAudio',
      //'getMediasoupActivity',
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
    }
  },

  methods: {
    ...mapGetters([]),
    ...mapMutations([
      'openQuitDialog',
      'closeQuitDialog',
      'closeDrawer',
      //'openDrawer',
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
          this.log("initialize Mediasoup Room", "DEBUG");
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
          await room.enableMic(this.audioStream, this.microphone, !this.hasAudio);
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
        //this.log(`${peerId} volume : ${volume}`, "DEBUG");
        let peer = this.getPeerById(peerId);
        peer.volume = volume || -100;
        if (!peer) {
          this.log(`peer not found ${peerId}`, "ERROR")
          return;
        }
        let component = this.getPeerComponent(peerId);
        if (component) {
          component.volume = peer.volume;
        }
        this.getLayout().focusPeer(peer, volume, component);
      });
      this.room.on("newPeer", (peer) => {
        this.log(`New Peer : ${peer.id}`);
        this.addRemotePeer(peer);
      });
      this.room.on("peerClosed", (peerId) => {
        this.log(`peerClosed : ${peerId}`);
        let peer = this.getRemotePeer(peerId);
        peer.close();
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
      // bind button on this event for pause audio (only audio , video stop produce)
      /*this.room.on("pauseProducer", (id, message) => {
      });
      this.room.on("resumeProducer", (id, message) => {
      });*/
      this.room.on("resumeMyProducer", (message) => {
        switch (message.kind) {
          case "audio":
            this.setMedia("audio");
            break;
          case "video":
            this.setMedia("video");
            break;
          default:
            this.log(`Producer ${message.kind} Resumed :  ${message.producerId}`, "WARNING");
            this.log(message, "DEBUG");
        }
      });

      this.room.on("pauseMyProducer", (message) => {
        switch (message.kind) {
          case "audio":
            this.deleteMedias("audio");
            break;
          case "video":
            this.deleteMedias("video");
            break;
          default:
            this.log(`Producer ${message.kind} Paused : ${message.producerId}`, "WARNING");
            this.log(message, "DEBUG");
        }
      });

      this.room.on("disableWebcam", (producer) => {
        let component = this.getPeerComponent(this.peer.id);
        //this.peer.deleteProducer(producer.id);
        return component.deleteProducer(producer);
      });
      this.room.on("disableShare", async (id) => {
        this.deleteMedias("screen");
        this.getLayout().stopDisplayShare(id);
      });
      this.room.on("consume", async (consumer, peer) => {
        this.log(`Consume event : ${peer.id}`);
        //peer.addConsumer(consumer);
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
        try {
          let peer = this.getRemotePeer(peerId);
          this.log(`consumerClosed : ${peerId} condumeId =${consumerId} `, "DEBUG");
          if (peer) {
            if (!appData.share) {
              let consumer = peer.hasConsumer(consumerId);
              if (consumer) {
                let component = this.getPeerComponent(peerId);
                return await component.deleteConsumer(consumer);
              }
            } else {
              return this.getLayout().stopDisplayShare(consumerId);
            }
          }
          if (appData.share) {
            return this.getLayout().stopDisplayShare(consumerId);
          }
        } catch (e) {
          this.log(e, "WARNING");
        }
      });
      this.room.on("consumerPaused", (consumerId, peer) => {
        if (peer) {
          this.log(`${peer.id} consumerPaused => condumeid =${consumerId} `, "DEBUG");
          let consumer = peer.hasConsumer(consumerId);
          let component = this.getPeerComponent(peer.id);
          if (consumer.track.kind === "audio") {
            this.log(`muteTag  peer = ${peer.id} `, "WARNING");
            return component.muteTag();
          }
          if (consumer.track.kind === "video") {
            this.log(`pauseVideoTag  peer = ${peer.id} `, "WARNING");
            return component.pauseVideoTag();
          }
        }
      });
      this.room.on("consumerResumed", (consumerId, peer) => {
        if (peer) {
          this.log(`${peer.id} consumerResumed => condumeid =${consumerId} `, "DEBUG");
          let consumer = peer.hasConsumer(consumerId);
          let component = this.getPeerComponent(peer.id);
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
        case 1:
          this.grid = true;
          break;
        case 0:
          this.focus = true;
          break;
        default:
          this.focus = true;
      }
    },
    getPeerComponent(peerId) {
      return this.getLayout().getPeerComponent(peerId);
    },
    getPeerById(peerid) {
      if (this.peer.id === peerid) {
        return this.peer
      }
      return this.peers.find((peer) => {
        if (peer.id === peerid) {
          return peer;
        }
      });
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
          //this.peer = null;
          //this.room = null;
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
    },
    sockClose() {
      return this.$router.replace({
          name: 'HomeMeeting',
          params: {
            roomid: this.roomid
          },
          force: true
        })
        .catch(() => {})
    }
  }

}
</script>

<style scoped>

</style>
