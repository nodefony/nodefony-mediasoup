
<template>
<v-container fluid class="ma-0 pt-5 pa-3" style="width:100%;height:100%;">

  <v-row v-show="focusPeers" class="mb-5" style="flex-wrap: nowrap;background-justify-space-between;color:black;width:100%;height:100%">

    <!--v-col cols="4" style="width:100%;height:100%" class="flex-grow-0 flex-shrink-0 px-1">
      <v-card rounded flat width="100%" style="background:transparent" class="ma-1">
        <video :ref="`video-${peer.id}`" style="width:100%;border-radius:8px;" />
      </v-card>
    </v-col-->

    <v-col cols="12" style="width:100%;height:100%;" class="d-flex align-content-start justify-space-around flex-wrap px-1">
      <v-card max-width="300px" min-width="200px" rounded flat style="background:transparent" class="ma-1 mb-3">
        <video :ref="`video-${peer.id}`" style="max-width:300px;border-radius:8px;" />
      </v-card>
      <v-card max-width="300px" min-width="200px" rounded outlined v-for="(mypeer) in peers" :key="mypeer.id" style="background:transparent" class="ma-1 mb-3">
        <video :ref="`video-${mypeer.id}`" style="max-width:300px;border-radius:8px;" />
      </v-card>

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

export default {
  name: 'GridLayout',
  components: {

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
    setTimeout(() => {
      this.$nextTick(async () => {
        await this.playPeer(this.peer);
        this.hideSlider();
        await this.displayPeers();
      });
    }, 1000);
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
      setTimeout(() => {
        this.displayPeers();
      }, 200);
    },
    /*focusPeers() {
      console.log(`focus change`, this.focusPeers)
      this.displayPeers();
    }*/
  },
  methods: {
    ...mapMutations(['hideSlider']),
    displayPeers() {
      return new Promise((resolve, reject) => {
        try {
          this.peers.map(async (peer, index) => {
            await this.playPeer(peer, index)
          })
          return resolve(this.peers)
        } catch (e) {
          return reject(e);
        }
      });
    },
    playPeer(peer) {
      if (peer && peer.videoStream && peer.videoStream.stream) {
        let indexTag = `video-${peer.id}`;
        let videoTag = this.$refs[indexTag];
        if (!videoTag) {
          return Promise.resolve();
        }
        if (videoTag[0]) {
          videoTag = videoTag[0];
        }
        videoTag.srcObject = peer.videoStream.stream;
        return videoTag.play()
          .catch(e => {
            this.log(e, "ERROR");
          });
      }
      return Promise.resolve();
    },
    /*playPeer(peer, index) {
      let videoTag = null;
      let indexTag = null;
      if (index === 0) {
        indexTag = `video-lead`;
      } else {
        indexTag = `video-${peer.id}`;
      }
      videoTag = this.$refs[indexTag];
      console.log(indexTag, videoTag, this.$refs)
      if (!videoTag) {
        return Promise.resolve();
      }
      if (videoTag[0]) {
        videoTag = videoTag[0];
      }
      console.log(peer.videoStream.stream)
      if (peer && peer.videoStream && peer.videoStream.stream) {
        videoTag.srcObject = peer.videoStream.stream;
        console.log(videoTag)
        this.log(`Layout play ${peer.id}`)
        return videoTag.play()
          .catch(e => {
            this.log(e, "ERROR");
          });
      }
      return Promise.resolve();
    }*/
  }
}
</script>

<style scoped >

</style>
