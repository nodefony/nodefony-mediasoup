<template>
<v-card color="" :loading="isSharing">
  <template v-slot:progress>
    <v-progress-linear absolute color="green lighten-3" height="4" indeterminate></v-progress-linear>
  </template>

  <v-toolbar style="background-color:#F40F02" dark extended>
    <template v-slot:extension>
      <v-btn fab bottom left absolute>
        <v-icon dark style="font-size:90px">mdi-pdf-box</v-icon>
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
  <admin-panel class="mt-4" v-on:name="setName" v-on:title="setTitle" :availableMediaUrls="pdf" v-on:save="save" v-on:loading="loading">
    <!-- EXAMPLE SLOT AdminPanel DISTINCT CONFIG PDF MEDIA -->
    <template v-slot:AdminPanel="slotProps">
      <v-row>
        <v-col cols="5">
          <v-subheader>Iframe Sroll Offset</v-subheader>
        </v-col>
        <v-col cols="7">
          <v-select dense :items="[0,10,20,30]" outlined label="Iframe srool offset" v-model="slotProps.formData.sroll">
          </v-select>
        </v-col>
      </v-row>

    </template>
  </admin-panel>

</v-card>
</template>

<script>
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';
import AdminPanel from '@/components/meetings/nav/medias/AdminPanel'

export default {
  name: 'DialogPdf',
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
      mediaName: 'PDF Viewer',
      mediaTitle: 'my tittle',
      url: '',
      pdf: [{
          mediaUrl: `${window.location.host}/app/pdf/vue-js-fr.pdf`,
          name: 'vue-js-fr.pdf',
          title: 'Apprenez vue-js'
        },
        {
          mediaUrl: `${window.location.host}/app/pdf/RX-V685.pdf`,
          name: 'YAMAHA',
          title: 'RX-V685'
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
      // valid form 
      this.$mediasoup.send("openMedia", formdata);
    },
    loading(value) {
      this.isSharing = value;
    },
  }

}
</script>

<style scoped lang="scss">

</style>
