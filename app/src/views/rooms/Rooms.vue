<template>
<v-window style="background-color:#f2f5f8">
  <v-container v-show="!selectedRoom" fluid class="ma-0 pa-0">

    <v-toolbar fixed outlined width="100%" color="blue-grey" dark flat style="top: 64px;position:fixed;">

      <v-icon class="mr-5">mdi-home</v-icon>

      <v-toolbar-title class="mx-5"> {{$t('rooms.name')}}</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-toolbar>
    <v-layout v-if="layout==='table'" style='margin-top:64px'>
      <v-container fluid class="ma-5">
        <v-card-title>
          {{$t('rooms.name')}}
          <v-btn v-if="isAdmin" x-small class="ml-5" color="grey" @click="selectRoom({}, true)">Create</v-btn>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :loading="loading" :headers="headers" :items="rooms" :items-per-page="10" class="elevation-2" :search="search">
          <template v-slot:item.name="{ item }">
            <v-btn small class="mr-2" @click="joinMeetingOnRoom(item)">
              {{item.name}}
            </v-btn>
          </template>
          <template v-slot:item.actions="{ item }">
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
    <room-edit :room="selectedRoom" :creating="create" class="mt-5" ref="selectedRoom" v-on:close="closeRoom" />
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
      create: false,
      selectedRoom: null,
      layout: "table",
      countall: null,
      search: ""
    }
  },
  mounted() {
    this.getRooms();
  },
  computed: {
    ...mapGetters([
      'hasRole'
    ]),
    isAdmin() {
      return this.hasRole("ROLE_ADMIN")
    },
    headers() {
      return [{
        text: this.$t("rooms.name"),
        align: 'start',
        sortable: false,
        value: 'name',
      }, {
        text: this.$t("rooms.description"),
        value: 'description'
      }, {
        text: this.$t("rooms.secure"),
        value: 'secure'
      }, {
        text: this.$t("rooms.access"),
        value: 'access'
      }, {
        text: this.$t("rooms.waiting"),
        value: 'waitingconnect'
      }, {
        text: this.$t("rooms.actions"),
        value: 'actions',
        sortable: false
      }]
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
        name: 'HomeMeeting',
        params: {
          roomid: item.name
        }
      })
    },
    selectRoom(item, create = false) {
      if (create) {
        this.create = create;
        this.selectedRoom = item;
      } else {
        return this.$router.push({
          name: 'Room',
          params: {
            roomid: item.name
          }
        });
      }
    },
    closeRoom() {
      this.selectedRoom = null;
    },
    async deleteRoom(item) {
      const name = item.name;
      return this.$mediasoup.request(`room/${name}`, "DELETE")
        .then((response) => {
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`Delete ${name} ok`, "INFO");
          }
          this.$emit("remove", item);
          this.getRooms();
          return response.result.room;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    }
  }

}
</script>
