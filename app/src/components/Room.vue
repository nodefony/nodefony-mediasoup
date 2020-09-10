<template>
<v-container fluid>
  <v-card class="mx-auto" max-width="500">
    <v-card-title class="title font-weight-regular justify-space-between">
      <span>{{ currentTitle }}</span>
      <v-avatar color="primary lighten-2" class="subheading white--text" size="24" v-text="step"></v-avatar>
    </v-card-title>
    <v-window v-model="step">

      <v-window-item :value="1">
        <div class="pa-4 text-center">
          <v-avatar color="primary lighten-2" class="subheading white--text" size="100">
            {{room.name}}
          </v-avatar>
          <h3 class="title font-weight-light mb-2">Welcome to Room {{room.displayName || room.name}}</h3>
          <span class="caption grey--text">Continue To connect</span>
        </div>
      </v-window-item>

      <v-window-item :value="2">
        <v-card-text>
          <v-text-field :disabled="isAuthenticated" label="Email" :value="peerId"></v-text-field>
          <span class="caption grey--text text--darken-1">
            This is the name you will use to login to Room
          </span>
        </v-card-text>
      </v-window-item>

      <v-window-item :value="3">
        <v-card-text>
          <v-text-field label="Password" type="password" :disabled="! room.secure"></v-text-field>
          <v-text-field label="Confirm Password" type="password" :disabled="! room.secure"></v-text-field>
          <span class="caption grey--text text--darken-1">
            Please enter a password for join room
          </span>
        </v-card-text>
      </v-window-item>
    </v-window>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn name="Back" :disabled="step === 1" text @click="lastStep">
        Back
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn v-if='step < 3' name="Next" color="primary" depressed @click="lastStep">
        Next
      </v-btn>
      <v-btn v-if='step === 3' name="Join" :disabled="room.secure" color="primary" depressed @click="lastStep">
        Join
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-dialog v-model="dialog" persistent max-width="600">
    <v-card>
      <v-system-bar color="indigo darken-2" dark>
        <v-icon @click="agree"> mdi-close</v-icon>
      </v-system-bar>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-avatar color="blue-grey" size="125">
              <span class="white--text headline">{{peerId}}</span>
            </v-avatar>
          </v-col>
        </v-row>
      </v-container>
      <v-card-title class="headline">
        Join to {{room.name}} Room ?
      </v-card-title>
      <v-card-subtitle>
        Peer : {{peerId}}
      </v-card-subtitle>
      <v-card-actions>
        <v-btn small name="desagree" class="ma-3" @click="agree">Disagree</v-btn>
        <v-btn small name="agree" class="ma-3" outlined @click="agree">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import Media from "@/components/Media";

export default {
  name: 'Room',
  components: {
    Media
  },
  props: {
    room: {
      type: Object,
      default: null
    },
    peerId: {
      type: String,
      default: ""
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    },
    join: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {
      mdRoom: vm.room,
      peer: null,
      step: 1,
      dialog: false,
      peerElement: "me",
      mediasoupRoom: null
    }
  },
  computed: {
    currentTitle() {
      switch (this.step) {
        case 1:
          return `Room ${this.mdRoom.displayName || this.mdRoom.name}`;
        case 2:
          return 'Connect User'
        default:
          return `Join Room ${this.mdRoom.name}`;
      }
    }
  },
  async beforeMount() {

  },
  mounted() {
    if (this.join) {
      this.dialog = true;
    }
  },
  destroyed() {
    this.mdRoom = null;
    this.mediasoupRoom = null;
    this.peer = null;
  },
  methods: {
    async lastStep(event) {
      switch (event.currentTarget.name) {
        case "Next":
          this.step++;
          break;
        case "Back":
          this.step--;
          break;
        case "Join":
          this.dialog = true;
          break;
        default:
          return;
      }
    },
    async agree(event) {
      let response = null;
      switch (event.currentTarget.name) {
        case "agree":
          response = true;
          break;
        default:
          response = false;
      }
      this.log(`response : ${response}`, "DEBUG");
      this.$emit('join', response);
      if (response) {
        return await this.connect();
      }
      this.dialog = false;
    },
    async connect() {
      await this.$mediasoup.connect(this.mdRoom.name, this.peerId)
        .then(({
          room,
          peer
        }) => {
          this.peer = peer;
          this.mediasoupRoom = room;
          this.$emit('connect', room, peer);
          this.dialog = false;
          return {
            room,
            peer
          }
        })
        .catch((e) => {
          this.dialog = false;
          this.log(e, "ERROR");
        });
    },
  }
}
</script>
