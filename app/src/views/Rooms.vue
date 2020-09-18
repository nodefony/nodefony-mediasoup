<template>
<v-container class="fill-height" fluid>
  <!--v-row>
    <v-col class="d-flex flex-wrap">
      <Room :peerId="peerid" :isAuthenticated="isAuthenticated" class="ml-5 mb-5" v-for=" (item) in rooms" :ref="item.name" :room="item" :key="item.name" v-on:connect="connect">
      </Room>
    </v-col>
  </v-row-->
  <v-col cols="12">
    <v-row style="height: 600px;" align="start" justify="space-around">
      <Room :peerId="peerid" :isAuthenticated="isAuthenticated" class="ml-5 mb-5" v-for=" (item) in rooms" :ref="item.name" :room="item" :key="item.name" v-on:connect="connect">
      </Room>
    </v-row>
  </v-col>
</v-container>
</template>

<script>
import Room from "@/components/Room";
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';

export default {
  name: 'Rooms',
  components: {
    Room
  },
  props: {},
  data(vm) {
    return {
      peerid: null,
      rooms: []
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser'
    ])
  },
  async mounted() {
    if (this.isAuthenticated) {
      this.peerid = this.getUser;
    }
    return await this.getRoom();
  },

  destroyed() {

  },

  /*async created() {},*/
  methods: {
    ...mapMutations(["setRoom", "setPeer"]),
    ...mapActions(["API_REQUEST"]),
    connect(room, peer) {
      return this.$router.push({
        name: 'MettingRoom',
        params: {
          roomid: room.id
          //peerid: peer.id
        }
      })
    },
    async getRoom() {
      let res = await this.API_REQUEST("/room/api", "GET");
      let rooms = res.result.rows;
      rooms.forEach((item) => {
        this.rooms.push(item);
      });
      return rooms;
    }
  },
  watch: {

  }


}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  max-width: 100vw;
  padding: 0px;
}
</style>
