<template>
<v-card color="" :loading="isSharing">
  <template v-slot:progress>
    <v-progress-linear absolute color="green lighten-3" height="4" indeterminate></v-progress-linear>
  </template>

  <v-toolbar style="background-color:#F40F02" dark extended>
    <template v-slot:extension>
      <v-btn fab bottom left absolute>
        <v-icon dark style="font-size:90px">mdi-movie</v-icon>
      </v-btn>
    </template>
    <!--v-img class="" height="200" src="@/assets/chateau-if.jpg" style=""-->
    <v-row align="center" justify="center" style="width:100%">
      <v-col class="text-center">
        <h3 class="headline">
          {{ mediaName }}
        </h3>
        <span class="grey--text text--lighten-1">{{ mediaTitle }}</span>
      </v-col>
    </v-row>

    <v-spacer></v-spacer>
    <v-btn dark icon @click="close()">
      <v-icon small>mdi-close</v-icon>
    </v-btn>

  </v-toolbar>
  <video-admin-panel v-on:name="setName" v-on:title="setTitle" v-on:save="save" v-on:loading="loading"/>

</v-card>
</template>

<script>
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';
import VideoAdminPanel from '@/../../src/bundles/mediasoup-bundle/Resources/vue/components/VideoViewerAdminPanel.vue';

export default {
  name: 'DialogPdf',
  components: {
    "video-admin-panel": VideoAdminPanel
  },
  props: {},
  data() {
    return {
      isSharing: false,
      urlValid: false,
      mediaName: 'Video Viewer',
      mediaTitle: '',
      url: ''
    }
  },
  destroyed() {},
  mounted() {},
  methods: {
    setName(value) {
      this.mediaName = value;
    },
    setTitle(value) {
      this.mediaTitle = value;
    },
    close() {
      this.$emit('close');
    },
    save(formdata) {
      // valid form 
      this.$mediasoup.send("openMedia", formdata);
      this.$emit('close');
    },
    loading(value) {
      this.isSharing = value;
    },
  }

}
</script>

<style scoped lang="scss">

</style>
