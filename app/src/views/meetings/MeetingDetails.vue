<template>
<v-window style="background-color:#f2f5f8;">
  <v-card v-if="currentRoom" outlined class="mb-10 scroll" style="background:transparent">

    <v-toolbar fixed outlined width="100%" color="blue-grey" dark flat style="">

      <v-icon class="mr-5">mdi-video</v-icon>
      <v-toolbar-title class="mx-5"> {{$t('meetings.meetings')}} {{ currentRoom.id || ""}}
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-col justify="center" align="right">
        <v-btn x-small :loading="loading" :disabled="false" :color="color" class=" white--text" fab @click="toogleSocket">
          <v-icon small :color="iconColor" dark>mdi-cloud-upload</v-icon>
        </v-btn>
      </v-col>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab ref="peers">
            {{ $t(`rooms.peers`) }}
          </v-tab>
          <v-tab ref="room">
            {{ $t(`rooms.room`) }}
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

      <v-tab-item class="mx-5 my-3">
        <v-card flat>
          <v-data-table dense fixed-header height="520" :headers="peersHeaders" :items="peers" :items-per-page="15" class="elevation-2" :headers-length="30" :search="search" show-expand :single-expand="true">
            <template v-slot:item.id="{ item }">
              <v-chip x-small dark @click="$router.push({ name: 'User', params:{username:item.id}})">
                {{ item.id }}
              </v-chip>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                More info about {{ item.id }}
              </td>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn dark v-if="item.status == 'waiting'" x-small @click="authorise(item)">Authorised</v-btn>
            </template>
            <template v-slot:no-data>
            </template>
          </v-data-table>
        </v-card>
      </v-tab-item>

      <v-tab-item>
        <v-card flat>
          <v-container fluid>
            <v-list v-if='roomEntity'>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{roomEntity.name}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("name")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{roomEntity.description}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("rooms.description")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{roomEntity.access}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("rooms.access")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-row>
                    <v-col cols="3">
                      <v-list-item-title>{{$t("rooms.waiting")}}</v-list-item-title>
                      <v-list-item-subtitle>{{$t("rooms.hall")}}</v-list-item-subtitle>
                    </v-col>
                    <v-col cols="9">
                      <v-switch :disabled="true" v-model="roomEntity.waitingconnect"></v-switch>
                    </v-col>
                  </v-row>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="green--text" v-if="roomEntity.secure">
                    <v-icon left color="green"> mdi-lock </v-icon>{{$t("rooms.secure")}}
                  </v-list-item-title>
                  <v-list-item-title class="red--text" v-else>
                    <v-icon left color="red"> mdi-lock-off </v-icon>{{$t("rooms.unsecure")}}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-shield-account
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-chip class="mx-2 my-1" x-small v-for="user in roomEntity.users" :key="`${user.username}-chip`">
                      {{ user.username }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>Administrators</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

            </v-list>
          </v-container>
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
      color: "red darken-1",
      message: null,
      loading: false,
      currentRoom: null,
      roomEntity: null,
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
      this.loading = true;
      this.currentRoom = await this.getRoom(this.roomid);
      return this.getRoomEntity(this.roomid)
    } else {
      if (this.room) {
        this.currentRoom = this.room;
        return this.getRoomEntity(this.room.name)
      }
    }
  },
  beforeDestroy() {
    if (this.$sock) {
      return this.$sock.close(1000);
    }
  },

  computed: {
    ...mapGetters([
      'hasRole',
      'getMediasoupActivity'
    ]),
    iconColor() {
      if (this.getMediasoupActivity) {
        return "blue";
      }
      return "red lighten-3";
    },
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
        text: "status",
        align: 'start',
        sortable: true,
        value: 'status'
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
      }, {
        text: "",
        align: 'center',
        sortable: true,
        value: "actions"
      }];
    }
  },
  methods: {
    toogleSocket() {
      if (!this.$sock) {
        return this.startSocket();
      }
      return this.closeSocket();
    },
    startSocket() {
      this.$mediasoup.connectStats()
        .then((sock) => {
          this.$sock = sock;
          this.loading = false;
          this.color = "blue-grey";
          this.message = this.log("Connect mediasoup stats websocket ");
          this.$sock.send(JSON.stringify({
            method: "startRoomStats",
            roomid: this.roomid,
          }));
        }).catch(e => {
          this.color = "red darken-3";
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
          this.$sock = null;
        })
      this.$mediasoup.once("closeSockStats", (event) => {
        if (event.reason) {
          this.message = this.log(event.reason, "ERROR");
        }
      });
      this.$mediasoup.on("stats", this.onStatsMessage);
    },
    onStatsMessage(message) {
      switch (message.method) {
        case "roomStats":
          if (message.room) {
            this.currentRoom = message.room;
          }
          if (message.peers) {
            this.peers = message.peers;
          }
          break;
      }
    },
    closeSocket() {
      if (this.$sock) {
        this.$sock.close();
        this.$mediasoup.removeListener("stats", this.onStatsMessage);
        this.$sock = null;
        this.color = "red darken-3";
      }
    },
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
    getRoomEntity(roomid) {
      this.loading = true;
      return this.$mediasoup.request(`room/${roomid}`)
        .then((response) => {
          this.loading = false;
          this.roomEntity = response.result;
          return response.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.log(e, "ERROR");
          return null;
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
    },
    authorise(peer) {
      return this.$mediasoup.request(`meetings/${this.currentRoom.id}/${peer.id}/authorise`, "PUT")
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
