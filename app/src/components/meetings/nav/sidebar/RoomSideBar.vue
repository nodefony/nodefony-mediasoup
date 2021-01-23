<template>
<v-navigation-drawer v-if="room" width="25%" v-model="displaybar" right class="" style="position:fixed;top:64px;z-index:1000">

  <v-list-item style="postion:fixed;">
    <v-btn icon class="ml-2 mr-3">
      <v-icon v-if="menu === 'peers'" dark @click="setSideBar(undefined)">
        mdi-account-multiple
      </v-icon>
      <v-icon v-if="menu === 'chat'" dark @click="setSideBar(undefined)">
        mdi-message-text
      </v-icon>
    </v-btn>
    <v-list-item-content>
      <v-list-item-title class="title">
        {{menu}}
      </v-list-item-title>
      <v-list-item-subtitle>
        {{room.id}}
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>

  <room-card-peers v-if="menu === 'peers'" />

  <room-card-chat v-if="menu === 'chat'" />

</v-navigation-drawer>
</template>


<script>
import CardChat from './RoomCardChat';
import CardPeers from './RoomCardPeers';
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'RoomSideBar',
  components: {
    "room-card-chat": CardChat,
    "room-card-peers": CardPeers
  },
  props: {

  },
  data(vm) {
    return {}
  },
  mounted() {},
  computed: {
    ...mapGetters({
      room: 'getRoom',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'peers',
      'getSideBar',
      //'getRoomEntity'
    ]),
    menu() {
      switch (this.getSideBar) {
        case 1:
          return "chat"
        case 0:
          return "peers"
        default:
          return false
      }
    },
    displaybar: {
      get() {
        return this.menu;
      },
      set(value) {
        return value;
      }
    }
  },

  methods: {
    ...mapMutations([
      'setSideBar'
    ])
  },
}
</script>

<style scoped lang="scss">

</style>
