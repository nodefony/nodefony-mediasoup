<template>
  <admin-panel ref="panel" :settings="settings" v-on:name="setName" v-on:title="setTitle" :socketBinding="socketBinding" :availableMediaUrls="availableMediaUrls" :liteMode="liteMode" v-on:save="save" v-on:loading="loading"/>
</template>

<script>
import {
  mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';
import AdminPanel from '@/components/meetings/nav/medias/AdminPanel'

export default {
  name: 'VideoViewerAdminPanel',
  components: {
    'admin-panel': AdminPanel
  },
  props: {
    settings: {
      type: Object
    },
    socketBinding: {
      type: Object
    },
    liteMode: {
      type: Boolean
    }
  },
  data() {
    return {
      formData: {},
      availableMediaUrls: [{
        mediaUrl: `${window.location.host}/mediasoup-bundle/videos/oceans-clip.webm`,
        name: 'oceans-clip.webm',
        title: 'Océans'
      }]
    };
  },
  destroyed() {
    if (this.socketBinding) {
      this.socketBinding.removeListener("onSettings", this.onSettings);
    }
  },
  mounted() {
    if (this.settings) {
      Object.assign(this.formData, this.settings.data);
    }

    this.$refs.panel.selectChange(this.formData);

    if (this.socketBinding) {
      this.initEvents();
    }
  },
  methods: {
    setName(name) {
      this.$emit('name', name);
    },
    setTitle(title) {
      this.$emit('title', title);
    },
    loading(loading) {
      this.$emit('loading', loading);
    },
    save(formData) {
      Object.assign(this.formData, formData);
      if (this.settings) {
        const old_settings = Object.assign({}, this.settings.data);
        Object.assign(this.settings.data, this.formData);
        this.$emit('save', this.settings.data, old_settings);
      } else {
        this.$emit('save', this.formData);
      }
    },
    fillAdminForm(settings) {
      Object.assign(this.formData, settings);
    },
    initEvents() {
      this.onSettings = (settings) => {
        if (settings) {
          this.fillAdminForm(settings);
        }
      };
      this.socketBinding.on("onSettings", this.onSettings);
    }
  }
}
</script>

<style scoped lang="scss">

</style>
