<template>
  <v-container v-if="socketSynchronized">
    <video-viewer :socketBinding="socketBinding" v-if="isVideo" v-on:loaded="load" v-on:settings-save="saveAdminPanel"/>
  </v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations
} from 'vuex';

// @ is an alias to /src
import VideoViewer from './VideoViewer.vue';

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
    data: {
      type: Object
    }
  },
  data(vm) {
    return {
      message: null,
      settings: null,
      socketBinding: null,
      socket: null,
      socketSynchronized: false,
      currentMediaLayoutData: null
    };
  },
  computed: {
    ...mapGetters({
      peer: 'getPeer'
    }),
    socketUrl() {
      return `wss://${window.location.host}/mediasoup/ws/mediaviewer?roomid=${this.roomid}&peerid=${this.peer.id}`;
    },
    isVideo() {
      return this.type == 'video';
    }
  },
  methods: {
    saveAdminPanel(new_settings, old_settings) {
      this.toggleAdminPanel = false;
      this.settings.refreshBroadcastSettings(new_settings, old_settings);
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
    async connect() {
      this.socketSynchronized = false;

      this.log("Starting media", "INFO");

      let init_settings = null;
      this.socketBinding.once("onSettings", (settings) => {
        init_settings = settings;
      });

      await this.socketBinding.sendWait({
        action: "settings",
        method: "get"
      });

      if (!this.currentMediaLayoutData || !this.currentMediaLayoutData.mediaUrl) {
        if (!init_settings || !init_settings.mediaUrl) {
          this.message = this.log("No media URL provided", "ERROR");
          return;
        }

        this.currentMediaLayoutData = init_settings;
      }

      // Update server-side configuration if required
      if (!init_settings || init_settings.mediaUrl != this.currentMediaLayoutData.mediaUrl) {
        await this.socketBinding.sendWait({
          action: "settings",
          method: "set",
          data: this.currentMediaLayoutData
        });
      }
      this.socketSynchronized = true;
    },
    async load(viewer, settings) {
      if (this.viewer) {
        this.viewer.unlisten();
      }
      let url = 'https://' + this.currentMediaLayoutData.mediaUrl;

      this.viewer = viewer;
      this.settings = settings;
      this.viewer.on("onViewerError", (message) => {
        this.message = this.log(message, "ERROR");
      });

      await this.viewer.load(url);
    }
  },
  async mounted() { 
    this.currentMediaLayoutData = this.data ? this.data.media : null;
    this.socketBinding = this.$media_viewer.socketBinding;
    this.socketBinding.once("onConnected", this.connect.bind(this));
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
</script>

<style scoped lang="scss">
</style>
