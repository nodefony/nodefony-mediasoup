
<template>
<v-container fluid class="ma-0" style="width:100%;height:100%;overflow-y:auto">
  <v-row v-if="!peers.length" justify="center" align=center class="mb-5" style="color:black;width:100%;height:100%">

    <v-card color="primary" dark min-width="300px">
      <v-card-text>
        Waiting Participants
        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-row>
  <div class="d-flex align-content-start flex-wrap">
    <section class="c-section">
      <preview-peer max-width="100%" min-width="150px" max-height="100%" min-height="150px" rounded flat style="background:transparent" class="ma-1 mb-3" v-for="(mypeer) in peers" :key="`preview-${mypeer.id}`" :peerid="mypeer.id" :currentfocus="currentfocus" />

      <!--v-card max-width="500px" min-width="200px" max-height="300px" min-height="150px" rounded outlined v-for="nb in 20" :key="`vid-${nb}`" style="border:solid 1px white;background:transparent" class="ma-1 mb-3 align-self-center flex-wrap flex-grow-0">
        <video constrols :ref="`video-${nb}`" style="width:100%;height:100%;border-radius:8px;" />
      </v-card-->
    </section>
  </div>
</v-container>


<!--v-container fluid class="ma-0 pt-5 pa-3" style="width:100%;height:100%;">


  <v-row v-if="!peers.length" justify="center" align=center class="mb-5" style="color:black;width:100%;height:100%">

    <v-card color="primary" dark min-width="300px">
      <v-card-text>
        Waiting Participants
        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-row>

  <div class="wrapper">
    <section class="c-section">

      <v-row v-show="displayPeer" class="mb-5" style="flex-wrap: nowrap;background-justify-space-between;color:black;width:100%;height:100%">

        <v-col cols="12" style="width:100%;height:100%;" class="d-flex align-content-start justify-space-start flex-wrap px-1">

          <preview-peer max-width="400px" min-width="200px" max-height="300px" min-height="150px" rounded flat style="background:transparent" class="ma-1 mb-3 flex-wrap align-self-center flex-wrap flex-grow-0" v-for="(mypeer) in peers" :key="`preview-${mypeer.id}`"
            :peerid="mypeer.id" :currentfocus="currentfocus" />

          <v-card max-width="500px" min-width="200px" max-height="300px" min-height="150px" rounded outlined v-for="nb in 20" :key="`vid-${nb}`" style="border:solid 1px white;background:transparent" class="ma-1 mb-3 align-self-center flex-wrap flex-grow-0">
            <video constrols :ref="`video-${nb}`" style="width:100%;height:100%;border-radius:8px;" />
          </v-card>
        </v-col>
      </v-row>

    </section>
  </div>

</v-container-->
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
    },
    currentfocus: {
      type: String
    }
  },
  data( /*vm*/ ) {
    return {
      displayPeer: false
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
      this.displayPeer = false;
      setTimeout(() => {
        if (this.peers.length) {
          this.hideSlider();
          this.displayPeer = true;
        } else {
          this.showSlider();
        }
      }, 1000);
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

<style scoped lang="scss">
@mixin grid() {
    display: flex;
    flex-wrap: wrap;

    @supports(grid-area: auto) {
        //display: grid;
        //grid-gap: 16px 16px;
    }
}

@mixin gridAuto() {
    /*margin-left: -16px;*/
    width: 100%;
    height: 100%;
    > * {
        margin: 16px;
    }

    @media (min-width: 320px) {
        > * {
            width: calc((99%/ #{1}) - 16px);
            flex: 0 1 calc((99% / #{2}) - 16px);
        }
    }

    @media (min-width: 768px) {
        > * {
            width: calc((99%/ #{2}) - 16px);
            flex: 0 1 calc((99% / #{3}) - 16px);
        }
    }

    @media (min-width: 1024px) {
        > * {
            width: calc((99%/ #{3}) - 16px);
            flex: 1 1 auto;
        }
    }

    @supports(grid-area: auto) {
        //grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        /*margin-left: 16px;*/
        > * {
            //width: auto;
            margin-left: 0;
            margin-bottom: 0;
        }
    }
}

.c-section {
    @include grid();
    @include gridAuto();
}
</style>
