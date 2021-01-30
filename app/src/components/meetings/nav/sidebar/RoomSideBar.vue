<template>
<v-navigation-drawer v-if="room" width="25%" v-model="displaybar" right class="" style="position:fixed;top:65px;z-index:1000">

  <room-card-peers v-show="menu === 'peers'" />

  <room-card-chat v-show="menu === 'chat'" />

</v-navigation-drawer>
</template>


<script>
import CardChat from './RoomCardChat';
import CardPeers from './RoomCardPeers';
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';

export default {
  name: 'RoomSideBar',
  components: {
    "room-card-chat": CardChat,
    "room-card-peers": CardPeers
  },
  props: {

  },
  data() {
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
