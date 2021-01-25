<template>
<v-card max-width="450" class="mx-auto" style="border:none">
  <v-toolbar color="teal" dark class="fixed-bar">
    <v-btn icon class="">
      <v-icon dark @click="setSideBar(undefined)">
        mdi-account-multiple
      </v-icon>
    </v-btn>
    <v-toolbar-title>Participants</v-toolbar-title>

    <v-spacer></v-spacer>

  </v-toolbar>

  <view-peers view="list" dense />

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
      room: 'getRoom',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'peers',
      'getTrigramme'
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
    position: sticky;
    position: -webkit-sticky;
    /* for Safari */
    top: 0;
    z-index: 1000;
}
</style>
