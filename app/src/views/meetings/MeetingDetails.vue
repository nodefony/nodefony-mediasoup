<template>
<v-card v-if="currentRoom" outlined width="100%" class="mb-10 scroll" style="background:transparent">

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
        <v-tab ref="room">
          {{ $t(`rooms.room`) }}
        </v-tab>
        <v-tab ref="worker">
          Worker
        </v-tab>
        <v-tab ref="worker">
          Router
        </v-tab>

        <v-tab ref="network">
          Network
        </v-tab>
      </v-tabs>
    </template>
  </v-toolbar>

  <v-tabs-items v-model="tab">

    <v-tab-item>
      <room-card :room="currentRoom" :entity="roomEntity" :peers="peers" />
    </v-tab-item>

    <v-tab-item>
      <worker-card :graph="sock ? true : false" :room="currentRoom" :worker="currentRoom.status.worker" />
    </v-tab-item>

    <v-tab-item>
      <router-card :graph="sock ? true : false" :room="currentRoom" :router="currentRoom.status.router" />
    </v-tab-item>

    <v-tab-item>
      <network-card :room="currentRoom" :peers="peers" :entity="roomEntity" />
    </v-tab-item>
  </v-tabs-items>

</v-card>
</template>

<script>
import {
  mapGetters
  //mapMutations,
  //mapActions
} from 'vuex';

import networkCard from '@/plugins/vis/components/networkCard';
import workerCard from '@/plugins/mediasoup/components/workerCard';
import routerCard from '@/plugins/mediasoup/components/routerCard';
import roomCard from '@/plugins/mediasoup/components/roomCard';

export default {
  name: 'MeetingsDetails',
  components: {
    "network-card": networkCard,
    "worker-card": workerCard,
    "router-card": routerCard,
    "room-card": roomCard
  },
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
      sock: null
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
    if (this.sock) {
      return this.sock.close(1000);
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
    }
  },
  methods: {
    toogleSocket() {
      if (!this.sock) {
        return this.startSocket();
      }
      return this.closeSocket();
    },
    startSocket() {
      this.$mediasoup.connectStats()
        .then((sock) => {
          this.sock = sock;
          this.loading = false;
          this.color = "blue-grey";
          this.message = this.log("Connect mediasoup stats websocket ");
          this.sock.send(JSON.stringify({
            method: "startRoomStats",
            roomid: this.roomid,
          }));
        }).catch(e => {
          this.color = "red darken-3";
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
          this.sock = null;
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
      if (this.sock) {
        this.sock.close();
        this.$mediasoup.removeListener("stats", this.onStatsMessage);
        this.sock = null;
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
