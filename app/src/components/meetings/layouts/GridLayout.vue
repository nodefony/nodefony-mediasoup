
<template>
<v-container fluid fill-height class="ma-0 pa-0">

  <v-row style="margin-top:65px">

    <!-- body -->

    <v-sheet tile style="width:100%;height:100%;background-color:transparent;position:fixed;margin-left:12px;margin-right:12px;border:none">

      <v-container fluid class="pa-0 ma-0 vid-container">


        <v-expand-transition>
          <video v-show="body" class="pa-0 ma-0 vid-video" muted playsinline :controls="false" ref="body" />
        </v-expand-transition>

        <v-expand-transition>
          <media-card-peer v-show="shared" tile width="100%" height="100%" class="my-0 mx-1 pa-0" ref="share" name="Screen" />
        </v-expand-transition>

        :<wbr>
        <div v-show="!body" class="pa-3 d-flex flex-wrap">
          <media-card-peer tile width="33%" height="50%" max-height="100%" max-width="100%" mim-height="160" min-width="200" class="my-0 mx-1 pa-0" :ref="peer.id" :remote="peer" :name="peer.id" />

          <media-card-peer v-for="(remotePeer, index) in peers" :key="index" tile width="33%" height="50%" max-height="100%" max-width="100%" mim-height="160" min-width="200" class="my-0 mx-1 pa-0" :ref="remotePeer.id" :name="remotePeer.id" :remote="remotePeer" />
        </div>
      </v-container>
    </v-sheet>

  </v-row>


  <!--v-row v-show="slider" style="bottom:0;position:fixed;z-index:1000;width:100%;height:160px" class="mb-2">
    <v-expand-transition>
      <slider-layout ref="slider" v-on:focus='focus' v-on:unfocus='unFocus' />
    </v-expand-transition>
  </v-row-->

</v-container>
</template>


<script>
import MediaCardPeer from '@/components/meetings/medias/peers/MediaCardPeer';
import SliderLayout from '@/components/meetings/layouts/SliderLayout';
import {
  mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';

export default {
  name: 'GridLayout',
  components: {
    "media-card-peer": MediaCardPeer,
    "slider-layout": SliderLayout
  },
  props: {},
  data( /*vm*/ ) {
    return {
      body: false,
      shared: false,
      audioThreshold: -50,
      slide: null,
      selectedPeer: null,
      focusTab: []
    }
  },
  mounted() {
    //console.log(this.peers)
    this.peers.map((peer) => {
      let component = this.getPeerComponent(peer.id);
      peer.consumers.map((consumer) => {
        component.addConsumer(consumer)
      });
    })
  },
  computed: {
    ...mapGetters({
      peer: 'getPeer',
      //room: 'getRoom',
    }),
    ...mapGetters([
      'peers',
      //'getRemotePeer',
      'slider'
    ]),
    myfocusTab() {
      return this.focusTab.map((peerid, index) => {
        let component = this.getPeerComponent(peerid);

        if (component && component.videoStream && component.videoStream.stream) {
          setTimeout(() => {
            let video = this.$refs[`focus-${index}`];
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
  methods: {
    getPeerComponent(peerId) {
      if (this.$refs[peerId][0]) {
        return this.$refs[peerId][0];
      }
      return this.$refs[peerId];
    },
    getShareComponent() {
      return this.$refs["share"];
    },
    play(peer, stream = null) {
      if (!stream) {
        if (!peer.videoStream.stream) {
          return Promise.resolve();
        }
        stream = peer.videoStream.stream;
      }
      this.$refs.body.srcObject = stream;
      return this.$refs.body.play()
        .then(() => {
          this.body = true;
          this.selectedPeer = peer;
          return Promise.resolve(this.selectedPeer);
        })
        .catch(e => {
          this.body = false;
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
            //this.addFocusTab(peerid);
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
    async focus(peer, stream = null) {
      await this.unFocus();
      return this.play(peer, stream);
    },
    unFocus() {
      return new Promise((resolve) => {
        this.body = false;
        this.selectedPeer = null;
        setTimeout(() => {
          this.$refs.body.srcObject = null;
          return resolve()
        }, 200);
      });
    },

    async displayShare(peer) {
      this.shared = true;
      let component = this.getShareComponent()
      if (component && component.videoStream && component.videoStream.stream) {
        //this.$refs.slider.displayShare(peer, component.videoStream.stream);
        await this.play(peer, component.videoStream.stream);
      }
    },
    stopDisplayShare() {
      this.shared = false;
      //this.$refs.slider.stopDisplayShare();
    }
  }
}
</script>

<style scoped >
.vid-container {
  /*position: relative;*/
  background-color: black;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.vid-video {
  width: 100%;
  height: 100%
}
</style>
