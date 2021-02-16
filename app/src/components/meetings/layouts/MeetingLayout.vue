
<template>
<v-row class="row-layout">

  <!-- slider layout-->
  <v-fade-transition>
    <v-row v-show="slider" class="mb-4 slider-layout">
      <slider-layout ref="slider" v-on:focus='focus' v-on:unfocus='unFocus' />
    </v-row>
  </v-fade-transition>

  <v-sheet tile class="layout-sheet">

    <v-container v-if="room" fluid class="pa-0 ma-0 video-container">

      <!-- Screen layout -->
      <v-expand-transition>
        <video ref="screen" v-show="screen" class="vid-share" muted playsinline :controls="false" />
      </v-expand-transition>

      <!-- Peer focus layout -->
      <v-expand-transition>
        <!--video ref="peer" v-show="selectedPeer" class="vid-video" muted playsinline :controls="false" /-->
        <peer-preview v-if="selectedPeer" :peerid="selectedPeer.id" />
      </v-expand-transition>

      <!-- Media layout -->
      <v-expand-transition>
        <media-viewer type="video" v-if="mediaLayout" :data="currentMediaLayoutData" :roomid="room.id" />
      </v-expand-transition>

      <!-- Main layout -->
      <v-expand-transition>
        <grid-layout ref="main" v-show="room && layout && !selectedPeer" :focusPeers="focusTab" class="" :currentfocus="currentfocus" />
      </v-expand-transition>
    </v-container>
  </v-sheet>

</v-row>
</template>


<script>
import SliderLayout from '@/components/meetings/layouts/SliderLayout';
import GridLayout from '@/components/meetings/layouts/GridLayout';
import MediaViewer from '@/../../src/bundles/mediasoup-bundle/Resources/vue/components/MediaViewer';
import PreviewPeer from '@/components/meetings/medias/peers/PreviewPeer'

import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';

export default {
  name: 'MettingLayout',
  components: {
    "grid-layout": GridLayout,
    "slider-layout": SliderLayout,
    "media-viewer": MediaViewer,
    "peer-preview": PreviewPeer
  },
  props: {},
  data( /*vm*/ ) {
    return {
      screen: false,
      eventready: false,
      audioThreshold: -50,
      selectedPeer: null,
      focusTab: [],
      currentfocus: null,
      currentToogle: null,
      currentMediaLayoutData: null
    }
  },
  destroyed() {
    this.room.removeListener("openMedia", this.onOpenMedia);
  },

  mounted() {

    if (this.room) {
      this.room.on("openMedia", this.onOpenMedia);
      this.eventready = true;
    }

  },
  computed: {
    ...mapGetters({
      peer: 'getPeer',
      room: 'getRoom'
    }),
    ...mapGetters([
      'peers',
      'slider',
      'mediaLayout',
      'layout'
    ]),
  },
  watch: {
    mediaLayout(value) {
      if (value) {
        this.unFocus(this.currentToogle);
      }
    },
    layout(value) {
      if (value) {
        this.hideMediaLayout();
        this.selectedPeer = null;
      }
    },
    room() {
      if (!this.eventready) {
        this.room.on("openMedia", this.onOpenMedia);
      }
    }
  },
  methods: {
    ...mapMutations([
      //peer: 'getPeer',
      'toogleMediaLayout',
      'hideMediaLayout',
      'showMediaLayout'
    ]),
    getPeerComponent(peerId) {
      return this.$refs.slider.getPeerComponent(peerId);
    },
    getShareComponent() {
      return this.$refs.slider.getShareComponent();
    },

    playPeer(peer) {
      this.selectedPeer = peer;
      return Promise.resolve(this.selectedPeer);
    },

    focusPeer(peer, volume, component) {
      if (volume && volume >= this.audioThreshold) {
        //let component = this.getPeerComponent(peerid);
        this.currentfocus = peer.id;
        if (component) {
          if (!component.focus) {
            this.log(`Focus Audio peer : ${peer.id}`, "DEBUG");
            component.focus = true;
            setTimeout(() => {
              component.focus = false;
            }, 2000);
          }
        }
        //this.addFocusTab(peer);
      }
    },
    addFocusTab(peer) {
      if (!peer) {
        return this.focusTab;
      }
      if (!peer) {
        return;
      }
      const found = this.focusTab.find(ele => ele.id === peer.id);
      if (found) {
        //console.log(`found peer in array ${peer.id}`)
        this.sortFocusPeer();
        return this.focusTab;
      } else {
        if (this.focusTab.length < 4) {
          //console.log(`PUSH peer in array ${peer.id}`)
          this.focusTab.push(peer)
        } else {
          //console.log(`POP and place frist peer in array ${peer.id}`)
          this.focusTab.pop();
          this.focusTab.unshift(peer)
        }
        return this.focusTab;
      }
    },

    sortFocusPeer() {
      //console.log("sort")
    },

    // slider events
    async focus(peer, stream = null, active, toogle, index) {
      this.currentToogle = toogle;
      await this.unFocus(false);
      if (index === "share") {
        return this.playShare(peer, stream)
      }
      return this.playPeer(peer, stream);
    },

    unFocus(callToogle, type) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (callToogle) {
            callToogle();
            this.currentToogle = null;
          } else {
            if (callToogle !== false) {
              this.currentToogle = null;
            }
          }
          switch (type) {
            case "share":
              this.$refs.screen.srcObject = null;
              this.screen = false;
              break;
            case "peer":
              //this.$refs.peer.srcObject = null;
              this.selectedPeer = null;
              break;
            default:
              //this.$refs.peer.srcObject = null;
              this.$refs.screen.srcObject = null;
              this.screen = false;
              this.selectedPeer = null;
          }
          return resolve()
        }, 200);
      });
    },

    // shrare screen
    playShare(peer, stream = null) {
      if (!stream) {
        if (peer && peer.videoStream && peer.videoStream.stream) {
          stream = peer.videoStream.stream;
        } else {
          return Promise.resolve();
        }
      }
      this.$refs.screen.srcObject = stream;
      return this.$refs.screen.play()
        .then(() => {
          this.screen = true;
          return Promise.resolve();
        })
        .catch(e => {
          this.screen = false;
          this.log(e, "DEBUG")
        });
    },

    async displayShare(peer) {
      let component = this.getShareComponent()
      if (component && component.videoStream && component.videoStream.stream) {
        this.$refs.slider.displayShare(peer, component.videoStream.stream);
        await this.playShare(peer, component.videoStream.stream);
      }
    },
    stopDisplayShare(id = null) {
      let res = this.$refs.slider.stopDisplayShare(id);
      if (res) {
        return this.unFocus(this.currentToogle, "share");
      }
      this.screen = true;
    },
    onOpenMedia(data) {
      this.currentMediaLayoutData = data;
      this.showMediaLayout();
    }
  }
}
</script>

<style scoped >
.row-layout {
  margin: 65px 0 0 0
}

.slider-layout {
  bottom: 0;
  position: fixed;
  z-index: 1000;
  width: 100%;
}

.layout-sheet {
  width: 100%;
  height: 100%;
  background-color: transparent;
  position: fixed;
  border: none;
}

.video-container {
  background-color: black;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.vid-video {
  width: 100%;
  height: 100%;
}

.vid-share {
  width: 100%;
  height: 93%;
}
</style>
