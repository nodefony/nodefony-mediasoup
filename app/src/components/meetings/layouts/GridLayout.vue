
<template>
<v-container fluid class="ma-0 pt-5 pa-3" style="width:100%;height:100%;">

  <v-row v-if="!peers.length" justify="center" align=center class="mb-5" style="color:black;width:100%;height:100%">

    <v-card color="primary" dark min-width="300px">
      <v-card-text>
        Waiting Participants
        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-row>
  <v-row v-show="focusPeers" class="mb-5" style="flex-wrap: nowrap;background-justify-space-between;color:black;width:100%;height:100%">

    <v-col cols="12" style="width:100%;height:100%;" class="d-flex align-content-start justify-space-around flex-wrap px-1">

      <!--preview-peer max-width="300px" min-width="200px" rounded flat style="background:transparent" class="ma-1 mb-3" :peer="peer" /-->

      <preview-peer max-width="300px" min-width="200px" rounded flat style="background:transparent" class="ma-1 mb-3" v-for="(mypeer, index) in peers" :key="`preview-${index}`" :peer="mypeer" />

      <!--v-card max-width="300px" min-width="200px" rounded outlined v-for="nb in 100" :key="`vid-${nb}`" style="border:solid 1px white;background:transparent" class="ma-1 mb-3">
        <video :ref="`video-${nb}`" style="max-width:300px;border-radius:8px;" />
      </v-card-->
    </v-col>

  </v-row>

</v-container>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';
import PreviewPeer from '@/components/meetings/medias/peers/PreviewPeer'

export default {
  name: 'GridLayout',
  components: {
    'preview-peer': PreviewPeer
  },
  props: {
    focusPeers: {
      type: Array
    }
  },
  data( /*vm*/ ) {
    return {
      tab: new Array(6)
    }
  },
  async mounted() {
    if (this.peers.length) {
      this.hideSlider();
    }
  },
  computed: {
    ...mapGetters({
      peer: 'getPeer'
    }),
    ...mapGetters(['peers']),
    mypeers() {
      return this.focusPeers.filter((peer, index) => {
        if (index !== 0) {
          return peer;
        }
      });
    },
    peerCardWidth() {
      return `${(100/this.nbCols)-1}%`;
    },
    peerCardHeight() {
      return `${100/this.nbLines}%`;
    },
    nbCols() {
      // switch(true){
      //   case this.peers.length <= 1 :
      //     return 1;
      //   case this.peers.length % 2 :
      //   return
      //
      // }
      if (this.peers.length) {
        return 4
      }
      return 1;
    },
    nbLines() {
      if (this.peers.length) {
        if (this.peers.length > 1) {
          if (this.peers.length % 2 === 0) {
            return (this.peers.length) / 2;
          }
          return (this.peers.length + 1) / 2
        }
        return 1
      }
      return 1;
    }
  },
  watch: {
    peers() {
      if (this.peers.length) {
        this.hideSlider();
      } else {
        this.showSlider();
      }
    }
  },
  methods: {
    ...mapMutations([
      'hideSlider',
      'showSlider'
    ])
  }
}
</script>

<style scoped >

</style>
