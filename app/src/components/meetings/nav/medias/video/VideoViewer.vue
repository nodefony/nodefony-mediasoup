<template>
<media-viewer-template type="video" :settings="settings" :roomAdmin="roomAdmin" :socketBinding="socketBinding" v-on:connected="connected">
  <template v-slot:media="{ type }">
    <video controls :id='videoId' class="video">
      <source/>
    </video>
  </template>
  <template v-slot:AdminPanel>
    <video-admin-panel style="border-left: 1px solid rgba(0,0,0,.12);" :currentMediaLayoutData="currentMediaLayoutData" :settings="settings" :socketBinding="socketBinding" :liteMode="true" v-on:save="saveAdminPanel"></video-admin-panel>
  </template>
</media-viewer-template>
</template>

<script>
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';

// @ is an alias to /src
import MediaViewerTemplate from '../MediaViewerTemplate';
import VideoViewerAdminPanel from './VideoViewerAdminPanel';
import VideoManager from '@/plugins/mediasoup/mediaviewer/video/manager.js';
import VideoViewer from '@/plugins/mediasoup/mediaviewer/video/video.js';

export default {
  name: 'VideoViewer',
  components: {
    "video-admin-panel": VideoViewerAdminPanel,
    "media-viewer-template": MediaViewerTemplate
  },
  props: {
    socketBinding: {
      type: Object,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
    roomAdmin: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {
      videoId: 'videoElementViewer',
      viewer: null
    };
  },
  computed: { },
  methods: {
    saveAdminPanel(new_settings, old_settings) {
      this.$emit("settings-save", new_settings, old_settings);
    },
    async connected() {
      this.log("Starting Video media", "INFO");
      this.viewer = new VideoViewer(this.videoId, this.settings, this.$media_viewer.container, this.socketBinding, VideoManager);
      this.$emit("loaded", this.viewer, this.viewer.settings);
    }
  },
  mounted() {},
  created() {},
  watch: {},
  beforeUpdate() {},
  beforeDestroy() {}
}
</script>

<style scoped lang="scss">
.video {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
}
</style>
