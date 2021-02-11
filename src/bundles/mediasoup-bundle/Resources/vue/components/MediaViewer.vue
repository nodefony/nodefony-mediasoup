<template>
<v-card width=100% height="100%" tile elevation="4" outlined :loading="loading" class="" style="">

  <v-card-title color="blue-grey" dark class="title font-weight-regular justify-space-between">
    <v-icon x-large class="mr-5">mdi-blur</v-icon>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">Media</v-list-item-title>
          <v-list-item-subtitle class="text-capitalize">{{type}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-spacer></v-spacer>

    <v-list dense>
      <v-list-item>
        <v-list-item-content style="text-align: center;">
          <!--v-list-item-title class="text-h6">Name</v-list-item-title-->
          <v-list-item-subtitle class="text-capitalize">{{currentController.name}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-spacer></v-spacer>

    <v-btn icon v-if="!lockedAdminPanel" :disabled="lockedAdminPanel === null" :color="toggleAdminPanel ? 'blue-grey' : ''" @click="toggleAdminPanel = !toggleAdminPanel">
      <v-icon>mdi-cog</v-icon>
    </v-btn>

    <v-btn icon @click="forceRerenderMedia">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>

    <v-badge :value="controlOther" :color="controlColor" :content="currentController.name" left transition="scale-transition" class="text-capitalize">
      <v-btn x-small :color="socketStatusColor" class="white--text" fab @click="toggleSocket" :disabled="lockedAdminPanel">
        <v-icon v-if="controlOwn" small :color="socketActivityColor" dark>mdi-hand-right</v-icon>
        <v-icon v-if="controlOther" small :color="socketActivityColor" dark>mdi-lock</v-icon>
        <v-icon v-if="controlNone" small :color="socketActivityColor" dark>mdi-cloud-download</v-icon>
      </v-btn>
    </v-badge>
  </v-card-title>
  <v-container fluid style="height:100%;width:100%">

    <v-row style="height:100%;width:100%">
      <v-col style="height:100%;width:100%">
        <slot v-if="renderMedia" name="media" :type="type"></slot>
      </v-col>
      <v-slide-x-reverse-transition>
        <v-col md="2" height="100%" v-show="toggleAdminPanel">
          <v-card height="100%" flat tile elevation="0" class="d-flex flex-column">
            <v-card-title>{{$t("configuration")}}</v-card-title>
            <slot name="AdminPanel"> </slot>
          </v-card>
        </v-col>
      </v-slide-x-reverse-transition>
    </v-row>
  </v-container>
</v-card>
</template>

<script>
import Controls from '../mediaviewer/control.js'

export default {
  name: 'MediaViewer',
  components: {},
  props: {
    peerid: {
      type: String
    },
    roomid: {
      type: String
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      loading: true,
      renderMedia: true,
      message: null,
      toggleAdminPanel: false,
      lockedAdminPanel: false,
      currentController: {
        name: '',
        id: null,
        type: Controls.NONE
      },
      activityMeter: null,
      socket: null,
      socketBinding: null
    };
  },
  async mounted() {
    this.socketBinding = this.$media_viewer.socketBinding;
    this.initEvents(this.socketBinding);
    await this.toggleSocket();
  },
  beforeDestroy() {
    this.socket.close();
    this.socket = null;
  },
  watch: {
    message(pdu) {
      this.notify(pdu);
    }
  },
  computed: {
    socketStatusColor() {
      return (!this.socket) ? 'red darken-3' : 'blue-grey';
    },
    socketActivityColor() {
      if (!this.activityMeter) {
        return 'white';
      }
      return this.controlColor;
    },
    controlColor() {
      if (!this.currentController) {
        return 'blue';
      }
      return this.currentController.type == Controls.OTHER ? 'red lighten-2' : 'blue';
    },
    socketUrl() {
      return `wss://${window.location.host}/mediasoup/ws/mediaviewer?roomid=${this.roomid}&peerid=${this.peerid}`;
    },
    controlOwn() {
      return this.currentController.type == Controls.OWN;
    },
    controlOther() {
      return this.currentController.type == Controls.OTHER;
    },
    controlNone() {
      return this.currentController.type == Controls.NONE;
    }
  },
  methods: {
    async toggleSocket() {
      if (!this.socket) {
        this.socketBinding.detach();
        this.socket = await this.$media_viewer.connect(this.socketUrl);
        this.socketBinding.attach(this.socket);
      } else {
        this.socket.close();
        this.socket = null;
      }
    },
    triggerActivityMeter() {
      if (this.activityMeter) {
        clearTimeout(this.activityMeter);
        this.activityMeter = null;
      }
      this.activityMeter = setTimeout(() => {
        clearTimeout(this.activityMeter);
        this.activityMeter = null;
      }, 100);
    },
    initEvents(socketBinding) {
      socketBinding.on("onSendMessage", this.triggerActivityMeter.bind(this));
      socketBinding.on("onMessage", this.triggerActivityMeter.bind(this));
      socketBinding.on("onControlChange", (controller_id, control, peer_data) => {
        this.currentController.type = control;
        this.currentController.id = controller_id;
        this.currentController.name = peer_data ? (peer_data.surname + " " + peer_data.name) : '';
      });
      socketBinding.on("onConnected", () => {
        // Handshake done
        this.loading = false;
        this.$emit("loaded", socketBinding);
      });
    },
    forceRerenderMedia() {
      this.renderMedia = false;
      this.$nextTick().then(() => {
        this.renderMedia = true;
        this.$emit("loaded", this.socketBinding);
      });
    }
  }
}
</script>

<style scoped lang="scss">

</style>
