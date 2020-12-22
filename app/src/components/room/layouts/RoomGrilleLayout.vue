<template>
<v-row class="ma-0 pa-10">
  <media-card-peer v-for="(peer, index) in peers" class="ma-0 pa-0" :ref="peer.id" :remote="peer" :key="index" @click.native="tooglePeer(peer, index)" :name="peer.id" spectrum :active="layout" />
</v-row>
</template>


<script>
import MediaCardPeer from '../../medias/peers/MediaCardPeer';
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
    }
  },
  data(vm) {
    return {

    }
  },
  mounted() {
    if (this.active) {
      this.log(`mounted grid layout`, "DEBUG")
    }
  },
  computed: {
    ...mapGetters([
      'peers'
    ])
  },

  methods: {
    tooglePeer() {

    }
  },
}
</script>

<style scoped lang="scss">

</style>
