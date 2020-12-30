<template>
<v-container fluid fill-height class="ma-0 pa-0">
  <v-row v-show="slider" style="margin-top:32px;top:0;position:fixed;z-index:1000;width:100%" class="px-6 pt-10">
    <v-sheet tile max-width="100%" max-height="160" style="background-color:transparent">
      <v-slide-group v-model="slide" class="" show-arrows style="background-color:transparent">

        <v-slide-item v-if="peer" :key="peer.id" v-slot="{ active, toggle }">
          <media-card-peer tile width="200" height="160" max-height="160" max-width="200" class="my-5 mx-5 pa-0" :ref="peer.id" :remote="peer" @click.native="tooglePeer(peer, active, toggle, peer.id)" :name="peer.id" :active="layout" style="margin:2px" />
        </v-slide-item>

        <v-slide-item class="mx-2 my-2" v-for="(remotePeer, index) in peers" :key="index" v-slot="{ active, toggle }">
          <media-card-peer tile width="200" height="160" max-height="160" max-width="200" class="my-5 mx-5 pa-0" :ref="remotePeer.id" :remote="remotePeer" @click.native="tooglePeer(remotePeer, active, toggle, index)" :name="remotePeer.id" :active="layout"
            style="margin:2px" />
        </v-slide-item>

        <!--v-slide-item class="mx-2" v-for="n in 10" :key="n" v-slot="{ active, toggle }" style="width:203px;height:168px">
          <v-card :elevation="12" width="200" height="160" max-height="160" max-width="200" :key="n" class="my-5 mx-5 pa-0" @click.native="tooglePeer(null, active, toggle, n)" style="margin:2px"></v-card>
        </v-slide-item-->

      </v-slide-group>
    </v-sheet>
  </v-row>

  <v-expand-transition>

    <v-card v-show="selectedPeer" elevation="8" width="100%" height="100%" outlined class="" style="top:48px">
      <v-system-bar color="teal lighten-1" lights-out>
        <v-icon left dark>
          mdi-video-outline
        </v-icon>
        <span v-if="selectedPeer">{{ selectedPeer.id }}</span>
        <v-spacer></v-spacer>
        <!--v-icon>mdi-minus</v-icon-->
        <!--v-icon>mdi-checkbox-blank-outline</v-icon-->
        <v-icon @click="toggle">mdi-close</v-icon>
      </v-system-bar>
      <v-container fluid fill-height class="pa-0 ma-0">
        <video style="width:100%;height:100%" class="pa-0 ma-0" muted playsinline :controls="false" ref="prevideo" />
      </v-container>
    </v-card>

  </v-expand-transition>
</v-container>
</template>


<script>
import MediaCardPeer from '../../medias/peers/MediaCardPeer';
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
export default {
  name: 'RoomFocusLayout',
  components: {
    "media-card-peer": MediaCardPeer
  },
  props: {
    layout: {
      type: Boolean,
    }
  },
  data(vm) {
    return {
      slide: null,
      selectedPeer: null,
      shared: false,
      audioThreshold: -50,
      videoThreshold: -35 //-30
    }
  },
  mounted() {
    if (this.layout) {
      this.log(`mounted slide layout`, "DEBUG")
    }
  },
  computed: {
    ...mapGetters({
      peer: 'getPeer',
      room: 'getRoom'
    }),
    ...mapGetters([
      'peers',
      'getRemotePeer',
      'slider'
    ])
  },
  methods: {
    ...mapGetters([]),
    toggle() {},
    play(peer) {
      if (!peer.videoStream.stream) {
        return;
      }
      this.unFocus();
      this.$refs.prevideo.srcObject = peer.videoStream.stream;
      return this.$refs.prevideo.play()
        .then(() => {
          this.selectedPeer = peer;
          return this.selectedPeer;
        })
        .catch(e => {
          this.selectedPeer = null
          this.log(e, "DEBUG")
        });
    },
    async tooglePeer(peer, active, toggle, index) {
      if (toggle) {
        this.toggle = toggle;
        toggle();
      }
      //this.log(`Index : ${index} Active : ${active} Peer : ${peer.id} Slide : ${this.slide} `, "DEBUG");
      if (peer && !active) {
        if (peer.videoStream.stream) {
          return this.play(peer);
        }
      } else {
        this.selectedPeer = null;
      }
    },

    focusPeer(peerid, volume) {
      // seuil focus audio
      if (volume && volume >= this.audioThreshold) {
        let ref = this.$refs[peerid];
        let component = null;
        if (ref && ref[0]) {
          component = ref[0];
        } else {
          component = ref;
        }
        if (component) {
          if (!component.focus) {
            this.log(`Focus Audio peer : ${peerid}`, "DEBUG");
            component.focus = true;
            setTimeout(() => {
              component.focus = false;
            }, 2000);
          }
        }
      }
      if (this.shared) {
        return;
      }
      if (!peerid) {
        if (this.selectedPeer) {
          return this.play(this.selectedPeer);
        }
      }
      let peer = this.getRemotePeer(peerid);
      if (!peer) {
        if (peerid !== this.peer.id) {
          return;
        }
        peer = this.peer;
      }

      // play
      if (this.selectedPeer && this.selectedPeer.id === peer.id) {
        return;
      }
      // seuil focus video
      if (volume > this.videoThreshold) {
        if (!peer.videoStream.stream) {
          return;
        }
        this.log(`Focus Video peer : ${peerid}`);
        return this.play(peer);
      }

    },
    unFocus() {
      this.selectedPeer = null;
      this.$refs.prevideo.srcObject = null;
    },
    displayShare(peer) {
      if (this.toggle) {
        this.toggle();
      }
      setTimeout(() => {
        this.play(peer)
          .then(() => {
            this.shared = true;
          })
          .catch(() => {
            this.shared = false;
          });
      }, 2000)
    },
    stopDisplayShare(peer) {
      if (this.toggle) {
        this.toggle();
      }
      setTimeout(() => {
        this.play(peer)
          .then(() => {
            this.shared = false;
          })
          .catch(() => {
            this.shared = false;
          });
      }, 2000);
    }
  }
}
</script>

<style scoped >

</style>
