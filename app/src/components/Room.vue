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

          <h3 class="title font-weight-light mb-2">Welcome to Room {{room.name}}</h3>
          <span class="caption grey--text">Continue To connect</span>
        </div>
      </v-window-item>

      <v-window-item :value="2">
        <v-card-text>
          <v-text-field label="Email" :value="peerId"></v-text-field>
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
    <Media v-if="peerId" class="ml-5 mb-5" key="me" :isMe="true" join :ref="peerElement" v-on:join="agree" :room="mediasoupRoom" :peer="peer" />
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
    }
  },
  data(vm) {
    return {
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
          return `Room ${this.room.name}`;
        case 2:
          return 'Connect User'
        default:
          return `Join Room ${this.room.name}`;
      }
    }
  },
  async beforeMount() {

  },
  destroyed() {
    this.room = null;
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
      console.log(event)
      let response = null;
      switch (event.currentTarget.id) {
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
    },
    async connect() {
      return await this.$mediasoup.connect(this.room.name, this.peerid)
        .then(({
          room,
          peer
        }) => {
          this.peer = peer;
          this.mediasoupRoom = room;
          this.$emit('connect', room, peer, this.$refs[this.peerElement].$el);
          this.dialog = true;
          return {
            room,
            peer
          }
        })
        .catch((e) => {
          this.log(e);
        });
    },
  }
}
</script>
