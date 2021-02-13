<template>
<v-card height="100%" width="100%" style="border:none" flat tile>
  <v-toolbar width="100%" color="teal darken-4" dark class="fixed-bar">
    <v-btn icon class="">
      <v-icon dark @click="setSideBar(undefined)">
        mdi-account-multiple
      </v-icon>
    </v-btn>
    <v-toolbar-title>Participants</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <view-peers view="list" dense class="fixed-bar" style="margin-top:65px" />

</v-card>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';

import ViewPeers from "@/components/meetings/peers/viewPeers";
export default {
  name: 'MenuPeers',
  components: {
    "view-peers": ViewPeers
  },
  data() {
    return {

    }
  },
  props: {},
  computed: {
    ...mapGetters({
      //room: 'getRoom',
      //peer: 'getPeer'
    }),
    ...mapGetters([
      //'peers',
      //'getTrigramme'
    ]),

  },
  mount() {},
  methods: {
    ...mapMutations([
      'setSideBar'
    ])
  }
}
</script>

<style scoped lang="scss">
.fixed-bar {
    position: fixed;
    top: 0;
    /* for Safari */
    z-index: 1000;
}
</style>
