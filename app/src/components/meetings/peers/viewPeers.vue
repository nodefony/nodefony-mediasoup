<template>
<v-container fluid>
  <!-- LIST -->
  <v-list v-bind="{...$props, ...$attrs}" v-if="view === 'list'" one-line>
    <header>{{room.id}}</header>

    <template v-for="(peer, index) in peersStatus">

      <v-list-item :key="peer.id">
        <v-list-item-avatar>
          <v-avatar color="primary" class="white--text">{{displayInitial(peer)}}</v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="subtitle-1">
            {{getDisplayname(peer)}}
          </v-list-item-title>
          <v-list-item-subtitle v-if="peer.status === 'joined'">
            {{peer.status}}
            <span v-if="peer.audio !== 'none'">
              <!--v-icon dense class="ml-4" color="">mdi-volume-high</v-icon-->
              <v-icon v-if="peer.audio === 'demute'" dense class="ml-4" color="">mdi-volume-high</v-icon>
              <v-icon v-else dense class="ml-4" color="">mdi-volume-off</v-icon>
            </span>
            <span v-if="peer.video !== 'none'">
              <v-icon v-if="peer.video ==='demute'" dense color="">mdi-video-box</v-icon>
              <v-icon v-else dense color="">mdi-video-box-off</v-icon>
            </span>
            <!--v-icon dense color="">mdi-video-box</v-icon-->
          </v-list-item-subtitle>
          <v-list-item-subtitle v-else-if="peer.status === 'waiting' || peer.status === 'authorised'">
            {{peer.status}}
            <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <div v-if="isRoomAdmin">
            <v-btn v-if="peer.status !== 'joined'" icon class="ml-1">
              <v-icon dense @click="authorise(peer)" color="blue">mdi-account-plus</v-icon>
            </v-btn>
            <v-btn v-if="peer.status !== 'joined'" icon>
              <v-icon dense @click="unauthorise(peer)" color="red">mdi-account-remove</v-icon>
            </v-btn>
          </div>
        </v-list-item-action>

      </v-list-item>
      <v-divider inset :key="`div-${index}`"></v-divider>
    </template>
  </v-list>

  <!-- SIMPLE TABLE -->
  <v-simple-table v-if="view === 'simpleTable'" v-bind="{...$props, ...$attrs}" fixed-header height="200px" style="width:100%">
    <template v-slot:top>
      <v-icon class="mx-5 my-3">mdi-account</v-icon>
      <span> Participants</span>
    </template>
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-left">
            Participants
          </th>
          <th class="text-left">
            Name
          </th>
          <th class="text-left">
            Surname
          </th>
          <th class="text-left">
            Status
          </th>
          <th v-if="true" class="text-left">

          </th>
        </tr>
      </thead>
      <tbody v-if="peers">
        <tr v-for="mypeer in peersStatus /*peersFilter*/" :key="mypeer.id">
          <td>{{ mypeer.id }}</td>
          <td>{{ mypeer.user ? mypeer.user.name : '' }}</td>
          <td>{{ mypeer.user ? mypeer.user.surname: '' }}</td>
          <td>
            <div v-if="mypeer.status === 'joined'">
              {{mypeer.status}}
              <span v-if="mypeer.audio !== 'none'">
                <v-icon v-if="mypeer.audio === 'demute'" dense class="ml-4" color="">mdi-volume-high</v-icon>
                <v-icon v-else dense class="ml-4" color="">mdi-volume-off</v-icon>
              </span>
              <span v-if="mypeer.video !== 'none'">
                <v-icon v-if="mypeer.video ==='demute'" dense color="">mdi-video-box</v-icon>
                <v-icon v-else dense color="">mdi-video-box-off</v-icon>
              </span>
            </div>
            <div v-else-if="mypeer.status === 'waiting' || mypeer.status === 'authorised'">
              {{mypeer.status}}
              <v-progress-linear color="deep-purple accent-4" indeterminate rounded height="6"></v-progress-linear>
            </div>
          </td>
          <td>
            <div v-if="isRoomAdmin && mypeer.id !== getProfileUsername">
              <v-btn v-if="mypeer.status !== 'joined'" icon class="ml-1">
                <v-icon dense @click="authorise(mypeer)" color="blue">mdi-account-plus</v-icon>
              </v-btn>
              <v-btn v-if="mypeer.status !== 'joined'" icon>
                <v-icon dense @click="unauthorise(mypeer)" color="red">mdi-account-remove</v-icon>
              </v-btn>
            </div>
          </td>
        </tr>

      </tbody>
    </template>
  </v-simple-table>

  <!-- DATA TABLE -->

</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations
  //mapActions
} from 'vuex';

export default {
  name: 'viewPeers',
  data() {
    return {
      message: null
    }
  },
  props: {
    view: {
      type: String,
      default: "list"
    }
  },
  mounted() {},
  destroyed() {
    this.log(`destroy peers component `, "DEBUG");
    this.$mediasoup.removeListener("waiting", this.onWaiting);
  },
  async created() {
    this.$mediasoup.on("waiting", this.onWaiting);
  },
  computed: {
    ...mapGetters({
      mdroom: 'getRoom',
      room: 'getRoomEntity',
      peer: 'getPeer'
    }),
    ...mapGetters([
      //'peers',
      'getTrigramme',
      'getProfileUsername',
      'getPeers',
      'hasRole'
    ]),
    peers: {
      get() {
        return this.getPeers;
      },
      set(value) {
        this.setPeers(value);
      }
    },
    peersStatus() {
      let peers = [];
      for (let peer of this.peers) {
        peers.push({
          id: peer.id,
          status: peer.status,
          audio: this.getPeerAudioStatus(peer),
          video: this.getPeerVideoStatus(peer),
          user: peer.user
        });
      }
      return peers;
    },
    peersFilter() {
      if (this.peers) {
        return this.peers.filter((peer) => {
          if (peer.id !== this.getProfileUsername) {
            return peer;
          }
        });
      }
      return [];
    },
    isAdmin() {
      return this.hasRole("ROLE_ADMIN");
    },
    isRoomAdmin() {
      let tab = this.room.users.filter((admin) => {
        if (admin.username === this.getProfileUsername) {
          return admin;
        }
      });
      if (tab.length) {
        return this.getProfileUsername;
      }
      return false;
    },

  },
  watch: {
    message(value) {
      if (value) {
        this.notify(value, {
          offset: 65,
        });
      }
    },
    peers() {
      this.nbPeersWainting();
    }
  },
  methods: {
    ...mapMutations([
      'setPeers',
      'setNbWaiting'
    ]),
    onWaiting(message) {
      if (message.message) {
        let pdu = this.log(message.message, "DEBUG");
        this.message = pdu;
      }
      if (message.peers) {
        this.peers = message.peers;
      }
    },
    nbPeersWainting() {
      let size = 0;
      if (this.peers) {
        size = this.peers.filter((peer) => {
          if (peer.status === "waiting") {
            return peer;
          }
        }).length;
      }
      this.setNbWaiting(size)
      return size;
    },
    getDisplayname(peer) {
      if (peer.user) {
        return `${peer.user.name} ${peer.user.surname}`;
      }
      return peer.displayName || peer.id;
    },
    displayTrigramme(peer) {
      if (peer.user) {
        let size = peer.user.surname.length;
        let trg = `${peer.user.name.substr(0, 1)}${peer.user.surname.substr(0, 1)}${peer.user.surname.substr(size-1,1)}`;
        return trg.toLowerCase();
      }
      return peer.displayName || peer.usrnane;
    },
    displayInitial(peer) {
      if (peer.user) {
        let trg = `${peer.user.name.substr(0, 1)}${peer.user.surname.substr(0, 1)}`;
        return trg.toLowerCase();
      }
      return peer.displayName || peer.usrnane;
    },

    authorise(peer) {
      if (this.isRoomAdmin) {
        this.loading = true;
        return this.$mediasoup.request(`meetings/${this.room.name}/${peer.id}/authorise`, "PUT")
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
    unauthorise(peer) {
      if (this.isRoomAdmin) {
        this.loading = true;
        return this.$mediasoup.request(`meetings/${this.room.name}/${peer.id}/unauthorise`, "PUT")
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
    getPeerAudioStatus(peer) {
      let status = 'none';
      for (let produc in peer.producers) {
        let producer = peer.producers[produc];
        if (producer.kind === "audio") {
          if (producer.paused) {
            status = 'mute'
          } else {
            status = 'demute'
          }
        }
      }
      return status;
    },
    getPeerVideoStatus(peer) {
      let status = 'none';
      for (let produc in peer.producers) {
        let producer = peer.producers[produc];
        if (producer.kind === "video") {
          if (producer.paused) {
            status = 'mute'
          } else {
            status = 'demute'
          }
        }
      }
      return status;
    }
  }

}
</script>

<style scoped lang="scss">

</style>
