<template>
<v-container fluid class="ma-0 pa-0">
  <v-sheet class="ma-0 pa-0" outlined tile max-width="100%">
    <v-slide-group v-model="slide" class="ma-0 pa-0" show-arrows>
      <v-slide-item class="pa-2" v-for="(peer, index) in peers" :key="index" v-slot="{ active, toggle }">
        <media-card-peer class="ma-0 pa-0" :ref="peer.id" :remote="peer" @click.native="tooglePeer(peer, active, toggle, index)" :name="peer.id" spectrum :active="layout" />
      </v-slide-item>
    </v-slide-group>
  </v-sheet>

  <v-container class="ma-0 pa-0" fluid>

    <v-expand-transition>
      <v-sheet v-show="slide != null" height="200" tile>
        <v-col id="body" cols="12" class="d-flex" style="flex-direction:column">
          <v-row class="fill-height" align="center" justify="center">
            <h3 class="title">
              Selected {{ slide }}
            </h3>
            <video style="width:100%;height:100%" class="pa-0 ma-0" muted playsinline :controls="true" :srcObject="selectedStream" ref="prevideo" />
          </v-row>
        </v-col>
      </v-sheet>
    </v-expand-transition>

  </v-container>
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
      selectedStream: null
    }
  },
  mounted() {
    if (this.active) {
      this.log(`mounted slide layout`, "DEBUG")
    }
  },
  computed: {
    ...mapGetters([
      'peers'
    ])
  },
  methods: {
    async tooglePeer(peer, active, toggle, index) {
      toggle();
      this.log(`Index : ${index} Active : ${active} Peer : ${peer.id} Slide : ${this.slide} `, "DEBUG");
      this.selectedStream = null;
      if (!active) {
        //peer.videoStream.mediaElement.srcObject = null;
        //this.selectedStream = peer.videoStream.stream;
        this.$refs.prevideo.srcObject = peer.videoStream.stream
        this.$refs.prevideo.play()
          .catch(e => {
            this.log(e, "DEBUG")
          });
      }
    }
  },
}
</script>

<style scoped lang="scss">

</style>
