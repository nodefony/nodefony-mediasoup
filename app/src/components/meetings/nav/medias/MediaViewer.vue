<template>
  <v-container v-if="socketSynchronized" fluid style="height:100%;width:100%;padding:0;">
    <video-viewer style="padding-bottom:140px;" :settings="settings" :socketBinding="socketBinding" v-if="isVideo" :roomAdmin="isRoomAdmin" v-on:loaded="load" v-on:settings-save="saveAdminPanel"/>
  </v-container>
</template>

<script>
import {
  mapGetters,
  //mapMutations
} from 'vuex';

// @ is an alias to /src
import VideoViewer from './video/VideoViewer';

import ViewerSettings from '@/plugins/mediasoup/mediaviewer/settings.js'

export default {
  name: 'MediaViewer',
  components: {
    "video-viewer": VideoViewer
  },
  props: {
    roomid: {
      type: String
    },
    type: {
      type: String
    },
    formData: {
      type: Object,
      default: null
    }
  },
  data(vm) {
    return {
      message: null,
      settings: null,
      socketBinding: null,
      socket: null,
      socketSynchronized: false
    };
  },
  computed: {
    ...mapGetters({
      peer: 'getPeer',
      room: 'getRoomEntity'
    }),
    ...mapGetters([
      'getProfileUsername',
    ]),
    socketUrl() {
      return `wss://${window.location.host}/mediasoup/ws/mediaviewer?roomid=${this.roomid}&peerid=${this.peer.id}`;
    },
    isVideo() {
      return this.type == 'video';
    },
    isRoomAdmin() {
      let tab = this.room.users.filter((admin) => {
        if (admin.username === this.getProfileUsername) {
          return admin;
        }
      });
      return tab.length > 0;
    }
  },
  methods: {
    saveAdminPanel(new_settings, old_settings) {
      this.settings.updateServerSettings(new_settings);
    },
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
    validateSettings(settings) {
      if ((!settings || !settings.mediaUrl)) {
        this.message = this.log("No media URL provided", "ERROR");
        throw new Error(this.message);
      }
    },
    async connectFromForm() {
      const settings = this.openMediaInfo.media;
      this.validateSettings(settings);
      if (this.openMediaInfo.peerId == this.peer.id) {
        // If you are the controller (the peer who shared the media), you first update settings to the server
        await this.settings.updateServerSettings(settings);
      } else {
        // Otherwise you only update your settings locally
        this.settings.update(settings);
      }

      // Now ensure we empty the openMediaInfo to avoid reloading data from an old form
      this.openMediaInfo = null;
    },
    async connect() {
      this.log("Starting media", "INFO");

      if (this.openMediaInfo) {
        // We can reconnect a media from an external form
        await this.connectFromForm();
      } else {
        // Or from a simple internal reload
        let settings = await this.settings.queryServerSettings();
        this.validateSettings(settings);
      }

      this.socketSynchronized = true;
    },
    async load(viewer) {
      this.viewer = viewer;
      this.viewer.on("onViewerError", (message) => {
        const pdu = this.log(message, "ERROR");
        if (this.$nodefony.environment == "development") {
          this.message = pdu;
        }
      });

      await this.viewer.load('https://' + this.settings.mediaUrl);
    }
  },
  async mounted() { 
    this.socketBinding = this.$media_viewer.socketBinding;
    if (!this.formData) {
      this.openMediaInfo = null;
    } else {
      this.openMediaInfo = Object.assign({}, this.formData);
    }
    this.settings = new ViewerSettings(this.socketBinding);

    this.onConnected = this.connect.bind(this);
    this.onSocketOpen = () => {
      if (this.socketBinding.isConnected()) {
        this.onConnected();
      } else {
        this.socketBinding.on("onConnected", this.onConnected);
      }
    };
    this.$media_viewer.on("onSocketOpen", this.onSocketOpen);
    await this.toggleSocket();
  },
  created() {},
  watch: {
    message(message) {
      this.notify(message);
    }
  },
  beforeUpdate() {},
  beforeDestroy() {
    if (this.viewer) {
      this.viewer.unlisten();
    }
    this.$media_viewer.removeListener("onSocketOpen", this.onSocketOpen);
    this.socketBinding.removeListener("onConnected", this.onConnected);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
</script>

<style scoped lang="scss">
</style>
