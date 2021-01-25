<template>
<v-container fluid>
  <!-- LIST -->
  <v-list v-bind="{...$props, ...$attrs}" v-if="view === 'list'" two-line>
    <header>{{room.id}}</header>
    <!--v-list-item v-if="local" :key="peer.id">
      <v-list-item-avatar>
        <v-avatar color="primary" class="white--text" :size="50">{{ getTrigramme  }}</v-avatar>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title v-html="peer.id"></v-list-item-title>
        <v-list-item-subtitle v-html="peer.id"></v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <v-btn icon>
          <v-icon color="grey lighten-1">mdi-information</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item-->

    <template v-for="(peer, index) in peers">

      <v-list-item :key="index">
        <v-list-item-avatar>
          <v-avatar color="primary" class="white--text">{{ peer.id  }}</v-avatar>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-html="peer.id"></v-list-item-title>
          <v-list-item-subtitle v-html="peer.status"></v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1">mdi-information</v-icon>
          </v-btn>
          <v-icon :color="peer.active ? 'deep-purple accent-4' : 'grey'">
            mdi-message-outline
          </v-icon>
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
            Display Name
          </th>
          <th class="text-left">
            Status
          </th>
          <th v-if="true" class="text-left">

          </th>
        </tr>
      </thead>
      <tbody v-if="peers">

        <tr v-for="peer in peersFilter" :key="peer.username">
          <td>{{ peer.id }}</td>
          <td>{{ peer.displayName }}</td>
          <td>{{ peer.status }}</td>
          <td v-if="isRoomAdmin || isAdmin">
            <v-btn class="ml-1" x-small @click="authorise(peer)">Authorise</v-btn>
            <v-btn x-small @click="unauthorise(peer)">UnAuthorise</v-btn>
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
    },
    local: {
      type: Boolean,
      default: true
    }
  },
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
      this.notify(value);
    }
  },
  methods: {
    ...mapMutations([
      'setPeers'
    ]),
    onWaiting(message) {
      console.log(message)
      let pdu = this.log(message.message, "DEBUG");
      this.message = pdu;
      if (message.peers) {
        this.peers = message.peers;
      }
    },
    displayTrigramme(peer) {
      return "cci";
    },
    displayInitial(peer) {
      return "cc";
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
    }
  }

}
</script>

<style scoped lang="scss">

</style>
