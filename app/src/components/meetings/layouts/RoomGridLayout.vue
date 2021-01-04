<template>
<v-container v-if="layout" fluid fill-height class="mt-15 mx-6 pa-0">

  <!--v-container v-show="!shared" fluid>
    <media-card-peer v-if="peer" max-width="300" max-height="300" class="ma-3 pa-0" :ref="peer.id" :remote="peer" :key="peer.id" :name="peer.id" spectrum :active="layout" />

    <media-card-peer v-for="(remotePeer, index) in peers" max-width="300" max-height="300" class="ma-3 pa-0" :ref="remotePeer.id" :remote="remotePeer" :key="index" :name="remotePeer.id" spectrum :active="layout" />
  </v-container>
  <v-expand-transition>
    <v-sheet v-show="shared" tile>

      <v-container fluid class="ma-0 pa-0">
        <v-card elevation="8" outlined class="ma-3">
          <v-system-bar color="teal lighten-1" lights-out>
            <v-icon left dark>
              mdi-video-outline
            </v-icon>
            <span v-if="selectedPeer">{{ selectedPeer.id }}</span>
            <v-spacer></v-spacer>
            <v-icon>mdi-minus</v-icon>
            <v-icon>mdi-checkbox-blank-outline</v-icon>
            <v-icon @click="toggle">mdi-close</v-icon>
          </v-system-bar>

          <video style="width:100%;height:100%" class="pa-0 ma-0" muted playsinline :controls="false" ref="prevideo" />
        </v-card>
      </v-container>

    </v-sheet>
  </v-expand-transition-->


  <v-card v-show="!shared" class="d-flex  justify-space-between flex-wrap" color="" flat tile min-height="200">

    <media-card-peer v-if="peer" max-width="300" max-height="300" class="ma-3 pa-0" :ref="peer.id" :remote="peer" :key="peer.id" :name="peer.id" spectrum :active="layout" />

    <media-card-peer v-for="(remotePeer, index) in peers" max-width="300" max-height="300" class="ma-3 pa-0" :ref="remotePeer.id" :remote="remotePeer" :key="index" :name="remotePeer.id" spectrum :active="layout" />


    <v-card v-for="n in 30" :elevation="12" width="300" height="200" max-height="200" max-width="300" :key="n" class="my-5 mx-5 pa-0" @click.native="tooglePeer(null, active, toggle, n)" style="margin:2px"></v-card>


  </v-card>

  <v-expand-transition>
    <v-sheet v-show="shared" tile>

      <v-container fluid class="ma-0 pa-0">
        <v-card elevation="8" outlined class="ma-3">
          <v-system-bar color="teal lighten-1" lights-out>
            <v-icon left dark>
              mdi-video-outline
            </v-icon>
            <span v-if="selectedPeer">{{ selectedPeer.id }}</span>
            <v-spacer></v-spacer>
            <v-icon>mdi-minus</v-icon>
            <v-icon>mdi-checkbox-blank-outline</v-icon>
            <v-icon @click="toggle">mdi-close</v-icon>
          </v-system-bar>

          <video style="width:100%;height:100%" class="pa-0 ma-0" muted playsinline :controls="false" ref="prevideo" />
        </v-card>
      </v-container>

    </v-sheet>
  </v-expand-transition>

</v-container>
</template>


<script>
import MediaCardPeer from '../medias/peers/MediaCardPeer';
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
export default {
  name: 'RoomGrilleLayout',
  components: {
    "media-card-peer": MediaCardPeer
  },
  props: {
    layout: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {
      selectedPeer: null,
      shared: false
    }
  },
  mounted() {
    if (this.layout) {
      this.log(`mounted grid layout`, "DEBUG")
    }
  },

  computed: {
    ...mapGetters({
      peer: 'getPeer',
      room: 'getRoom'
    }),
    ...mapGetters([
      'peers',
      'getRemotePeer'
    ])
  },

  methods: {
    toggle() {},
    tooglePeer() {},
    focusPeer(peerid, volume) {},
    unFocus(peer) {
      this.selectedPeer = null;
      this.$refs.prevideo.srcObject = null;
    },
    play(peer) {
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
      this.shared = false;
      setTimeout(() => {
        this.play(peer)
          .then(() => {
            this.selectedPeer = null;
          })
          .catch(() => {
            this.shared = false;
          });
      }, 2000);
    }
  },
}
</script>

<style scoped lang="scss">

</style>
