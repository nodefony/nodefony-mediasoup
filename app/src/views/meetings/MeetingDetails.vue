<template>
<v-window style="background-color:#f2f5f8;">
  <v-container fluid class="ma-0 pa-0">
    <v-toolbar fixed outlined width="100%" color="blue-grey" dark flat style="top: 64px;position:fixed;">

      <v-icon class="mr-5">mdi-google-classroom</v-icon>
      <v-toolbar-title class="mx-5"> {{$t('meetings.meetings')}} </v-toolbar-title>

      <v-spacer></v-spacer>

    </v-toolbar>
    <v-layout v-if="currentRoom" class="" style='margin-top:64px;'>
      <v-container fluid class="ma-5">
        <v-card-title>
          {{$t('meetings.meetings')}} {{ currentRoom.id || ""}}
          <v-spacer></v-spacer>
        </v-card-title>

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
  name: 'MeetingsDetails',
  components: {},
  props: {
    roomid: {
      type: String,
      default: ""
    },
    room: {
      type: Object,
      default: null
    }
  },
  data(vm) {
    return {
      message: null,
      loading: false,
      currentRoom: null
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
  async mounted() {
    if (this.roomid) {
      this.currentRoom = await this.getRoom(this.roomid);
    } else {
      if (this.room) {
        this.currentRoom = this.room;
      }
    }
  },
  destroyed() {},

  computed: {
    ...mapGetters([
      'hasRole'
    ]),
    isAdmin() {
      return this.hasRole("ROLE_ADMIN")
    },
  },
  methods: {
    getRoom(roomid) {
      this.loading = true;
      return this.$mediasoup.request(`meetings/${roomid}`, "GET")
        .then((data) => {
          this.loading = false;
          return data.result.room;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    },
    closeRoom(room) {
      this.loading = true;
      return this.$mediasoup.request(`meetings/${room.id}`, "DELETE")
        .then((data) => {
          this.loading = false;
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    }
  },
  watch: {
    message(value) {
      this.notify(value);
    }
  }
}
</script>


<style scoped>

</style>
