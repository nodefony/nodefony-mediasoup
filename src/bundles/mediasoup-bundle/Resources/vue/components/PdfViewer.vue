<template>
<media-viewer :roomid="roomid" :peerid="getPeer.id" type="pdf" v-on:loaded="start">
  <template v-slot:media="{ type }">
    <div class="holder">
      <iframe :id='iframeId' class="mediaIframe" webkitallowfullscreen='' mozallowfullscreen='' allowfullscreen=''></iframe>
      <div v-if="loadingBar" class="loadingFrame">
        <v-progress-linear class="loadingBar" indeterminate></v-progress-linear>
      </div>
    </div>
  </template>
  <template v-slot:AdminPanel>
    <admin-panel style="border-left: 1px solid rgba(0,0,0,.12);" v-if="!loading" :viewer="viewer" :socketBinding="socketBinding" v-on:save="saveAdminPanel"></admin-panel>
  </template>
</media-viewer>
</template>

<script>
import {
  mapGetters
} from 'vuex';

// @ is an alias to /src
import MediaViewer from './MediaViewer';
import PdfAdminPanel from './PdfAdminPanel';
import IframeViewer from '../mediaviewer/iframe/iframe.js'
import PdfIframeManager from '../pdf/manager.js';

export default {
  name: 'PdfViewer',
  components: {
    "admin-panel": PdfAdminPanel,
    "media-viewer": MediaViewer
  },
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {
      message: null,
      loading: true,
      loadingBar: true,
      iframeId: 'mediaIframe',
      socketBinding: null,
      viewer: null,
      settings: null
    };
  },
  computed: {
    ...mapGetters([
      'getPeer'
    ])
  },
  methods: {
    saveAdminPanel(new_settings, old_settings) {
      this.toggleAdminPanel = false;
      this.settings.refreshBroadcastSettings(new_settings, old_settings);
    },
    async start(socketBinding) {
      this.log("Starting PDF media", "INFO");
      if (this.viewer) {
        this.viewer.unlisten();
      }
      this.socketBinding = socketBinding;

      // Default Url
      const iframeUrl = `https://${window.location.host}/app/pdf/vue-js-fr.pdf`;

      this.viewer = new IframeViewer(this.iframeId, this.$media_viewer.container, this.socketBinding, PdfIframeManager);
      this.settings = this.viewer.settings;
      this.viewer.on("onViewerError", (message) => {
        this.message = this.log(message, "ERROR");
        this.loading = false;
      });

      this.viewer.on("onViewerStopped", (state) => {
        this.loading = false;
      });

      this.viewer.on("onViewerLoading", () => {
        this.loading = true;
        this.loadingBar = false;
      });
      this.viewer.on("onViewerLoaded", () => {
        this.loading = false;
      });

      await this.viewer.load(iframeUrl);

      // TODO if user is a room admin, true, if not, false
      const has_admin_rights = true;
      this.lockedAdminPanel = !has_admin_rights;
      this.loading = false;
    }
  },
  mounted() {},
  created() {},
  watch: {
    message(message) {
      this.notify(message);
    }
  },
  beforeUpdate() {},
  beforeDestroy() {
    this.viewer.unlisten();
  }
}
</script>

<style scoped lang="scss">
.mediaIframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}
.holder {
    width: 100%;
    height: 100%;
    padding-bottom: 140px;
    position: relative;
}
.loadingFrame {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.loadingBar {
    top: 50%;
    width: 70%;
    left: 15%;
}
</style>
