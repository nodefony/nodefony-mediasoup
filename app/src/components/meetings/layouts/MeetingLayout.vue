
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
        <video ref="peer" v-show="selectedPeer" class="vid-video" muted playsinline :controls="false" />
      </v-expand-transition>

      <!-- Media layout -->
      <v-expand-transition>
        <media-viewer ref="media" v-if="room && media" :roomid="room.id" type="video">
          <template v-slot:media="{ type }">
            <v-row align="center" justify="center">
              <h1>{{type}} </h1>
            </v-row>
          </template>
        </media-viewer>
      </v-expand-transition>

    </v-container>
  </v-sheet>

</v-row>
</template>


<script>
//import MediaCardPeer from '@/components/meetings/medias/peers/MediaCardPeer';
import SliderLayout from '@/components/meetings/layouts/SliderLayout';
import MediaViewer from '@/components/meetings/medias/MediaViewer';
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';

export default {
  name: 'MettingLayout',
  components: {
    //"media-card-peer": MediaCardPeer,
    "slider-layout": SliderLayout,
    "media-viewer": MediaViewer
  },
  props: {},
  data( /*vm*/ ) {
    return {
      screen: false,
      audioThreshold: -50,
      selectedPeer: null,
      focusTab: [],
      currentToogle: null
    }
  },
  mounted() {
    this.toogleMedia();
  },
  computed: {
    ...mapGetters({
      //peer: 'getPeer',
      room: 'getRoom',
    }),
    ...mapGetters([
      'peers',
      //'getRemotePeer',
      'slider',
      'media'
    ]),
    myfocusTab() {
      return this.focusTab.map((peerid, index) => {
        let component = this.getPeerComponent(peerid);
        if (component && component.videoStream && component.videoStream.stream) {
          setTimeout(() => {
            let video = this.$refs[`focus-${index}`];
            if (!video) {
              return
            }
            if (video[0]) {
              video = video[0];
            }
            video.srcObject = component.videoStream.stream;
            return video.play();
          }, 500);
        }
        return peerid;
      });
    }
  },
  watch: {
    media(value) {
      if (value) {
        this.unFocus(this.currentToogle);
      }
    },
    screen(value) {
      if (value) {
        //
      }
    }
  },
  methods: {
    ...mapMutations([
      //peer: 'getPeer',
      'toogleMedia'
    ]),
    getPeerComponent(peerId) {
      return this.$refs.slider.getPeerComponent(peerId);
    },
    getShareComponent() {
      return this.$refs.slider.getShareComponent();
    },

    playPeer(peer) {
      let stream = peer.videoStream.stream;
      if (!stream) {
        return Promise.resolve();
      }
      this.$refs.peer.srcObject = stream;
      return this.$refs.peer.play()
        .then(() => {
          this.selectedPeer = peer;
          return Promise.resolve(this.selectedPeer);
        })
        .catch(e => {
          this.selectedPeer = null
          this.log(e, "DEBUG")
        });
    },

    focusPeer(peerid, volume) {
      if (volume && volume >= this.audioThreshold) {
        let component = this.getPeerComponent(peerid);
        if (component) {
          if (!component.focus) {
            this.log(`Focus Audio peer : ${peerid}`, "DEBUG");
            this.addFocusTab(peerid);
            component.focus = true;
            setTimeout(() => {
              component.focus = false;
            }, 2000);
          }
        }
      }
    },
    addFocusTab(peerid) {
      if (!peerid) {
        return this.focusTab;
      }
      const found = this.focusTab.find(id => id === peerid);
      if (found) {
        return this.focusTab;
      }
      if (this.focusTab.length < 4) {
        this.focusTab.push(peerid)
      } else {
        this.focusTab.pop();
        this.focusTab.unshift(peerid)
      }
      return this.focusTab;
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
              this.$refs.peer.srcObject = null;
              this.selectedPeer = null;
              break;
            default:
              this.$refs.peer.srcObject = null;
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
    stopDisplayShare() {
      this.$refs.slider.stopDisplayShare();
      return this.unFocus(this.currentToogle, "share");
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
