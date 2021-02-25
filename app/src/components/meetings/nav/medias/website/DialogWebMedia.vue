<template>
<v-card color="" :loading="isSharing">
  <template v-slot:progress>
    <v-progress-linear absolute color="green lighten-3" height="4" indeterminate></v-progress-linear>
  </template>

  <v-toolbar style="background-color:#0000EE" dark extended>
    <template v-slot:extension>
      <v-btn fab bottom left absolute>
        <v-icon style="font-size:90px">mdi-application</v-icon>
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
    <v-btn dark icon @click="dialog.value = false">
      <v-icon small>mdi-close</v-icon>
    </v-btn>

  </v-toolbar>
  <admin-panel class="mt-4" v-on:name="setName" v-on:title="setTitle" :availableMediaUrls="web" v-on:save="save" v-on:loading="loading">
    <!-- TODO SLOT DISTINCT CONFIG MEDIA -->

  </admin-panel>

</v-card>
</template>


<script>
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';
import AdminPanel from '../AdminPanel'

export default {
  name: 'DialogWeb',
  components: {
    'admin-panel': AdminPanel
  },
  props: {
    dialog: {
      type: Object
    }
  },
  data() {
    return {
      isSharing: false,
      urlValid: false,
      mediaName: 'Web Site',
      mediaTitle: 'my site',
      url: '',
      web: [{
          mediaUrl: `nodejs.org/en/`,
          name: 'Node.js',
          title: ''
        },
        {
          mediaUrl: `vuejs.org/`,
          name: 'Vue',
          title: ''
        }
      ]
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
    save(formdata) {
      // TODO
      this.log(formdata);
    },
    loading(value) {
      this.isSharing = value;
    },
  }
}
</script>

<style scoped lang="scss">

</style>
