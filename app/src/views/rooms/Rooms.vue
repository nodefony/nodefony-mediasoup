<template>
<v-window style="background-color:#f2f5f8">
  <v-container v-show="!selectedRoom" fluid class="ma-0 pa-0">

    <v-toolbar fixed outlined width="100%" color="blue-grey" dark flat style="top: 64px;position:fixed; z-index:1000">

      <v-icon class="mr-5">mdi-home</v-icon>

      <v-badge inline color="cyan" :content="countall || 0">
        <v-toolbar-title class="mx-5"> {{$t('rooms.name')}}</v-toolbar-title>
      </v-badge>

      <v-spacer></v-spacer>
      <v-btn small>Create</v-btn>
    </v-toolbar>
    <v-layout v-if="layout==='table'" style='margin-top:64px'>
      <v-container fluid class="ma-5">
        <v-data-table :loading="loading" :headers="headers" :items="rooms" :items-per-page="10" class="elevation-2">
          <template v-slot:item.actions="{ item }">
            <v-btn small class="mr-2" @click="joinMeetingOnRoom(item)">
              {{$t('rooms.join')}}
            </v-btn>
            <v-icon small class="mr-2" @click="selectRoom(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="deleteRoom(item)">
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:no-data>
          </template>
        </v-data-table>
      </v-container>
    </v-layout>
    <v-layout v-if="layout==='grid'">
      <h1>TODO</h1>
    </v-layout>
  </v-container>
  <v-container v-if="selectedRoom" style="background-color:#f2f5f8">
    <room-edit :room="selectedRoom" class="mt-5" ref="selectedRoom" v-on:close="closeRoom" />
  </v-container>
</v-window>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import EditRoom from '@/views/rooms/EditRoom'
export default {
  name: 'Rooms',
  components: {
    "room-edit": EditRoom
  },
  props: {},
  data(vm) {
    return {
      loading: true,
      rooms: [],
      selectedRoom: null,
      layout: "table",
      countall: null
    }
  },
  mounted() {
    this.getRooms();
  },
  computed: {
    headers() {
      return [{
          text: this.$t("rooms.name"),
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: this.$t("rooms.description"),
          value: 'description'
        },
        {
          text: this.$t("rooms.secure"),
          value: 'secure'
        },
        {
          text: this.$t("rooms.access"),
          value: 'access'
        },
        {
          text: this.$t("rooms.actions"),
          value: 'actions',
          sortable: false
        },
      ]
    }
  },
  destroyed() {},
  beforeMount() {},
  methods: {
    async getRooms() {
      return this.$mediasoup.request("rooms")
        .then((data) => {
          this.countall = data.result.count;
          this.rooms = data.result.rows
          this.loading = false;
        })
        .catch(e => {
          this.log(e, "ERROR");
          this.loading = false;
          throw e
        })
    },
    joinMeetingOnRoom(item) {
      return this.$router.push({
        name: 'Meeting',
        params: {
          roomid: item.name
        }
      })
    },
    selectRoom(item) {
      this.selectedRoom = item;
    },
    closeRoom() {
      this.selectedRoom = null;
    },
    async deleteRoom(item) {
      this.selectedRoom = item;
      await this.$refs["selectedRoom"].deleteRoom();
    }
  }

}
</script>
