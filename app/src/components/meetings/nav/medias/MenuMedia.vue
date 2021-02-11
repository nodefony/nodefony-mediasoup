<template>
<v-card>
  <v-list dense>
    <v-subheader>Share Medias</v-subheader>
    <v-list-item-group v-model="selectedMedia" color="primary">

      <v-dialog v-model="pdf" transition="expend-transition" persistent max-width="55%">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-pdf-box</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                Share PDF Document
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:default="dialog">
          <dialog-pdf-media v-if="pdf" :dialog="dialog" />
        </template>
      </v-dialog>


      <v-dialog v-model="web" transition="expend-transition" persistent max-width="55%">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-application</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                Share Website
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:default="dialog">
          <dialog-web-media v-if="web" :dialog="dialog" />
        </template>
      </v-dialog>

    </v-list-item-group>
  </v-list>


</v-card>
</template>

<script>
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';
import DialogPdfMedia from '@/components/meetings/nav/medias/pdf/DialogPdfMedia.vue';
import DialogWebMedia from '@/components/meetings/nav/medias/website/DialogWebMedia.vue';

export default {
  name: 'MenuMedia',
  components: {
    'dialog-pdf-media': DialogPdfMedia,
    'dialog-web-media': DialogWebMedia
  },
  props: {},
  data(vm) {
    return {
      selectedMedia: [],
      pdf: false,
      web: false
    }
  },
  destroyed() {},
  mounted() {

  },
  computed: {

  },
  watch: {
    selectedMedia(value) {
      //console.log(`selectedMedia ${value}`)
      switch (value) {
        case 0:
          this.pdf = true
          break;
        case 1:
          this.web = true
          break;
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
