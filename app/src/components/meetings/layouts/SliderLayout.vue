<template>
<v-sheet tile max-width="100%" max-height="110" style="background-color:transparent">

  <v-slide-group v-model="slide" class="px-3" show-arrows style="background-color:transparent;height:110px">

    <v-slide-item key="share" v-show="shared" :elevation="focus" v-slot="{ active, toggle }">
      <media-card-peer width="200" height="110" class="my-0 mx-1 pa-0" ref="share" name="Screen" @click.native="tooglePeer(null , active, toggle, 'share' )" />
    </v-slide-item>

    <v-slide-item :key="peer.id" v-if="peer" :elevation="focus" v-slot="{ active, toggle }">
      <media-card-peer width="200" height="110" class="my-0 mx-1 pa-0" :ref="peer.id" :remote="peer" @click.native="tooglePeer(peer, active, toggle, peer.id)" :name="peer.id" />
    </v-slide-item>

    <v-slide-item v-for="(remotePeer, index) in peers" :key="index" v-slot="{ active, toggle }">
      <media-card-peer :elevation="focus" width="200" height="110" class="my-0 mx-1 pa-0" :ref="remotePeer.id" :remote="remotePeer" @click.native="tooglePeer(remotePeer, active, toggle, index)" :name="remotePeer.id" />
    </v-slide-item>

    <!--v-slide-item v-for="n in 10" :key="n" v-slot="{ active, toggle }">
        <v-card :elevation="1" width="200" height="110" max-height="110" max-width="200" :key="n" class="my-0 mx-1 pa-0">
          <v-row align="center" justify="center">
            {{n}}
          </v-row>
        </v-card>
      </v-slide-item-->

  </v-slide-group>
</v-sheet>
</template>

<script>
import MediaCardPeer from '@/components/meetings/medias/peers/MediaCardPeer';
import {
  mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';

export default {
  name: 'SliderLayout',
  components: {
    "media-card-peer": MediaCardPeer
  },
  props: {},
  data( /*vm*/ ) {
    return {
      slide: null,
      shared: false,
      shareStream: null,
      sharePeer: null,
      hasfocus: 0
    }
  },
  mounted() {},
  computed: {
    ...mapGetters({
      peer: 'getPeer',
      room: 'getRoom'
    }),
    ...mapGetters([
      'peers'
    ])
  },
  methods: {
    displayShare(peer, stream) {
      this.sharePeer = peer;
      this.shareStream = stream;
      this.shared = true;
    },
    stopDisplayShare() {
      let component = this.getShareComponent()
      if (component && component.videoStream && component.videoStream.stream) {
        component.videoStream.stop();
      }
      this.shareStream = null;
      this.sharePeer = null;
      this.shared = false;
    },
    async tooglePeer(peer, active, toggle, index) {
      toggle();
      if (index === "share") {
        if (this.$refs.share && this.$refs.share.videoStream && this.$refs.share.videoStream.stream) {
          if (!active) {

            this.focus(peer, this.$refs.share.videoStream.stream, active, toggle, index)
          } else {

            return this.unFocus(peer, null, active, toggle, index);
          }
        }
        return;
      }
      if (peer && !active) {
        if (peer.videoStream.stream) {
          return this.focus(peer, null, active, toggle, index);
        }
      } else {

        return this.unFocus(peer, active, toggle, index);
      }
    },
    focus(peer, stream, active, toggle, index) {
      this.hasfocus = 12;
      this.$emit('focus', peer, stream, active, toggle, index);
    },
    unFocus( /*peer, active, toggle, index*/ ) {
      this.hasfocus = 0;
      /*let component = null;
      if (peer) {
        component = this.getPeerComponent(peer.id)
      }*/
      this.$emit('unfocus' /*peer, component, active, toggle, index*/ );
    },
    getShareComponent() {
      if (this.$refs.share) {
        return this.$refs.share
      }
      return null;
    },
    getPeerComponent(peerid) {
      let ref = this.$refs[peerid];
      let component = null;
      if (ref && ref[0]) {
        component = ref[0];
      } else {
        component = ref;
      }
      if (component) {
        return component;
      }
      return component;
    }
  }
}
</script>

<style scoped>

</style>
