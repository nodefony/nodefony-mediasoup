<template>
<v-window style="background-color:#f2f5f8;">
  <v-container fluid class="ma-0 pa-0">
    <v-toolbar fixed outlined width="100%" color="#1a242d" dark flat style="top: 64px;position:fixed;">

      <v-icon class="mr-5">mdi-video</v-icon>
      <v-toolbar-title class="mx-5"> {{$t('meetings.meetings')}}</v-toolbar-title>

      <v-spacer></v-spacer>

    </v-toolbar>
    <v-layout class="" v-if="layout==='table'" style='margin-top:64px;'>
      <v-container fluid class="ma-5">
        <v-card-title>
          {{$t('meetings.meetings')}} Status
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table fixed-header height="520" :loading="loading" :headers="headers" :items="meetings" :items-per-page="15" class="elevation-2" :headers-length="30" :search="search">

          <template v-slot:item.id="{ item }">
            <v-btn x-small class="mr-2 mt-1" @click="redirect(item.id)">{{item.id}}</v-btn>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="selectRoom(item)">
              mdi-eye
            </v-icon>
            <v-icon v-if="isAdmin" small class="mr-2" @click="closeRoom(item)">
              mdi-delete
            </v-icon>
          </template>

          <template v-slot:no-data>
          </template>
        </v-data-table>
      </v-container>
    </v-layout>
  </v-container>
</v-window>
</template>

<script>
import {
  mapGetters
  //mapMutations,
  //mapActions
} from 'vuex';


export default {
  name: 'Meetings',
  components: {

  },
  props: {},
  data(vm) {
    return {
      message: null,
      search: "",
      loading: false,
      layout: "table",
      meetings: []
    }
  },
  /*beforeRouteUpdate(to, from, next) {
    return next();
  },
  beforeRouteLeave(to, from, next) {
    return next();
  },
  beforeRouteEnter(to, from, next) {
    return next();
  },*/
  beforeMount() {},
  mounted() {
    this.getMeetings();
  },
  destroyed() {},

  computed: {
    ...mapGetters([
      'hasRole'
    ]),
    isAdmin() {
      return this.hasRole("ROLE_ADMIN")
    },
    headers() {
      return [{
        text: this.$t("rooms.room"),
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "Closed",
        value: 'closed'
      }, {
        text: this.$t("rooms.peers"),
        value: 'status.peers'
      }, {
        text: "Worker (pid)",
        value: 'status.worker.pid'
      }, {
        text: "Router (id)",
        value: 'status.router.id'
      }, {
        text: "Broadcasters",
        value: 'status.broadcasters'
      }, {
        text: "",
        value: 'actions',
        sortable: false
      }, ]
    }
  },
  methods: {
    redirect(roomid) {
      return this.$router.push({
          name: "HomeMeeting",
          params: {
            roomid: roomid
          }
        })
        .catch(() => {})
    },
    async getMeetings() {
      this.loading = true;
      return this.$mediasoup.request("meetings")
        .then((data) => {
          this.meetings = data.result.rows
          this.loading = false;
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        })
    },
    closeRoom(room) {
      this.loading = true;
      return this.$mediasoup.request(`meetings/${room.id}`, "DELETE")
        .then((data) => {
          this.loading = false;
          this.message = this.log(data.result, "INFO");
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    },
    selectRoom(room) {
      return this.$router.push({
        name: 'MeetingDetails',
        params: {
          roomid: room.id
        }
      });
    }
  },
  watch: {
    message(value) {
      if (value) {
        this.notify(value);
        return
      }
      this.log("empty log", "WARNING");
    }
  }
}
</script>


<style scoped>

</style>
