
<template>
<v-container fluid fill-height class="ma-0 pa-0">

  <v-row style="margin-top:65px">

    <!-- body -->
    <v-expand-transition>
      <v-sheet v-if="body" tile style="width:100%;height:100%;background-color:transparent;position:fixed;margin-left:12px;margin-right:12px;border:none">
        <v-card width="100%" height="100%" class="pa-0 ma-0" style="border:none">
          <v-container fluid class="pa-0 ma-0 vid-container">
            <video class="pa-0 ma-0 vid-video" muted playsinline :controls="false" ref="body" />
          </v-container>
        </v-card>
      </v-sheet>
    </v-expand-transition>

    <!-- sharesreen -->
    <!--v-expand-transition>

      <v-sheet v-show="shared" width="100%" tile class="" style="background-color:transparent;position:fixed;border:solid 1px;margin-left:12px;margin-right:12px">
        <v-container fluid class="pa-0 ma-0 vid-container">
          <media-card-peer tile width="100%" height="100%" max-height="100%" class="my-0 mx-1 pa-0" ref="share" name="Screen" />
        </v-container>
      </v-sheet>

    </v-expand-transition-->
  </v-row>

  <v-row v-show="slider" style="bottom:0;position:fixed;z-index:1000;width:100%;height:160px" class="mb-2">
    <v-sheet tile max-width="100%" max-height="160" style="background-color:transparent">

      <v-slide-group v-model="slide" class="px-3" show-arrows style="background-color:transparent;height:160px">

        <v-slide-item v-show="shared" key="share" v-slot="{ active, toggle }">
          <media-card-peer tile width="200" height="160" max-height="160" max-width="200" class="my-0 mx-1 pa-0" ref="share" name="Screen" @click.native="tooglePeer(null, active, toggle, 'share' )" />
        </v-slide-item>

        <v-slide-item v-if="peer" :key="peer.id" v-slot="{ active, toggle }">
          <media-card-peer tile width="200" height="160" max-height="160" max-width="200" class="my-0 mx-1 pa-0" :ref="peer.id" :remote="peer" @click.native="tooglePeer(peer, active, toggle, peer.id)" :name="peer.id" />
        </v-slide-item>

        <v-slide-item v-for="(remotePeer, index) in peers" :key="index" v-slot="{ active, toggle }">
          <media-card-peer tile width="200" height="160" max-height="160" max-width="200" class="my-0 mx-1 pa-0" :ref="remotePeer.id" :remote="remotePeer" @click.native="tooglePeer(remotePeer, active, toggle, index)" :name="remotePeer.id" />
        </v-slide-item>

        <!--v-slide-item v-for="n in 10" :key="n" v-slot="{ active, toggle }">
          <v-card :elevation="1" width="200" height="160" max-height="160" max-width="200" :key="n" class="my-0 mx-1 pa-0">
            <v-row align="center" justify="center">
              {{n}}
            </v-row>
          </v-card>
        </v-slide-item-->


      </v-slide-group>
    </v-sheet>
  </v-row>

</v-container>
</template>


<script>
import MediaCardPeer from '@/components/meetings/medias/peers/MediaCardPeer';
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'MettingLayout',
  components: {
    "media-card-peer": MediaCardPeer
  },
  props: {},
  data( /*vm*/ ) {
    return {
      body: true,
      shared: false,
      shareStream: null,
      slide: null,
      selectedPeer: null,
      toggle: null,
      peerShare: null
    }
  },
  monted() {
    console.log(this.$refs)
  },
  computed: {
    ...mapGetters({
      peer: 'getPeer',
      room: 'getRoom',

    }),
    ...mapGetters([
      'peers',
      'getRemotePeer',
      'slider'
    ])
  },
  methods: {
    play(peer, stream = null) {
      if (!stream) {
        if (!peer.videoStream.stream) {
          return;
        }
        stream = peer.videoStream.stream;
      }

      this.unFocus();
      this.$refs.body.srcObject = stream;
      return this.$refs.body.play()
        .then(() => {
          this.selectedPeer = peer;
          return this.selectedPeer;
        })
        .catch(e => {
          this.selectedPeer = null
          this.log(e, "DEBUG")
        });
    },
    focusPeer(peerid, volume) {
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
    },
    unFocus() {
      this.selectedPeer = null;
      this.$refs.body.srcObject = null;
    },
    async tooglePeer(peer, active, toggle, index) {
      if (toggle) {
        this.toggle = toggle;
        toggle();
      }
      if (index === "share") {
        if (this.$refs.share && this.$refs.share.videoStream && this.$refs.share.videoStream.stream) {
          return this.play(peer, this.$refs.share.videoStream.stream);
        }
        return;
      }
      //this.log(`Index : ${index} Active : ${active} Peer : ${peer.id} Slide : ${this.slide} `, "DEBUG");
      if (peer && !active) {
        if (peer.videoStream.stream) {
          return this.play(peer);
        }
      } else {
        this.unFocus()
        this.selectedPeer = null;
      }
    },

    displayShare(peer, producer) {
      this.shareStream = producer.stream;
      this.shared = true;
      if (this.toggle) {
        this.toggle();
      }
      this.tooglePeer(null, false, null, 'share');
    },
    stopDisplayShare() {
      if (this.$refs.share && this.$refs.share.videoStream && this.$refs.share.videoStream.stream) {
        this.$refs.share.videoStream.stop();
      }
      this.shareStream = null;
      this.shared = false;
    }
  }
}
</script>

<style scoped >
.vid-container {
  /*position: relative;*/
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.vid-video {
  width: 100%;
}
</style>
