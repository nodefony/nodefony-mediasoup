<template>
<v-window style="background-color:#f2f5f8;">
  <v-card v-if="currentRoom" outlined class="mb-10 scroll" style="background:transparent">

    <v-toolbar fixed outlined width="100%" color="blue-grey" dark flat style="">

      <v-icon class="mr-5">mdi-video</v-icon>
      <v-toolbar-title class="mx-5"> {{$t('meetings.meetings')}} {{ currentRoom.id || ""}}
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab ref="room">
            {{ $t(`rooms.room`) }}
          </v-tab>
          <v-tab ref="peers">
            {{ $t(`rooms.peers`) }}
          </v-tab>
          <v-tab ref="worker">
            Worker
          </v-tab>
          <v-tab ref="router">
            Router
          </v-tab>
          <v-tab ref="consumer">
            Consumers
          </v-tab>
          <v-tab ref="data">
            Data
          </v-tab>
        </v-tabs>
      </template>

    </v-toolbar>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>

          <v-list two-line>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{currentRoom.id}}</v-list-item-title>
                <v-list-item-subtitle>{{$t("users.name")}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-tab-item>

      <v-tab-item class="mx-5 my-3">
        <v-card flat>
          <v-data-table dense fixed-header height="520" :headers="peersHeaders" :items="peers" :items-per-page="15" class="elevation-2" :headers-length="30" :search="search" show-expand :single-expand="true">
            <template v-slot:item.id="{ item }">
              <v-chip x-small :key="item" dark @click="$router.push({ name: 'User', params:{username:item.id}})">
                {{ item.id }}
              </v-chip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                More info about {{ item.id }}
              </td>
            </template>
            <template v-slot:no-data>
            </template>
          </v-data-table>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Worket pid : {{currentRoom.status.worker.pid}}</v-list-item-title>
              <v-list-item-subtitle v-for="(item, index) in currentRoom.status.worker.usage" :key="index">
                {{workerUsage[index]}} ( {{index}} ) : {{item }}
              </v-list-item-subtitle>

            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-tab-item>

      <v-tab-item>
        <v-card flat>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card flat>
        </v-card>
      </v-tab-item>
    </v-tabs-items>

  </v-card>
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
      currentRoom: null,
      peers: [],
      tab: null,
      search: "",
      workerUsage: {
        ru_idrss: "integral unshared data size",
        ru_inblock: "block input operations",
        ru_isrss: "integral unshared stack size",
        ru_ixrss: "integral shared memory size",
        ru_majflt: "page faults",
        ru_maxrss: "maximum resident set size",
        ru_minflt: "page reclaims",
        ru_msgrcv: "messages received",
        ru_msgsnd: "messages sent",
        ru_nivcsw: "involuntary context switches",
        ru_nsignals: "signals received",
        ru_nswap: "swaps",
        ru_nvcsw: "voluntary context switches",
        ru_oublock: "block output operations ",
        ru_stime: "system time used",
        ru_utime: "user time used"
      }
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
    peersHeaders() {
      return [{
        text: "name",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "producers",
        align: 'start',
        sortable: true,
        value: 'producers'
      }, {
        text: "consumers",
        align: 'start',
        sortable: true,
        value: 'consumers'
      }, {
        text: "transports",
        align: 'start',
        sortable: true,
        value: 'transports'
      }, {
        text: "dataProducers",
        align: 'start',
        sortable: true,
        value: 'dataProducers'
      }, {
        text: "dataConsumers",
        align: 'start',
        sortable: true,
        value: 'dataConsumers'
      }];
    }
  },
  methods: {
    getRoom(roomid) {
      this.loading = true;
      return this.$mediasoup.request(`meetings/${roomid}`, "GET")
        .then((data) => {
          this.loading = false;
          this.peers = data.result.peers;
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
