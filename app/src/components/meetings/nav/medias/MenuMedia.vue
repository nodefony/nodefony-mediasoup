<template>
<v-card>
  <v-list dense>
    <v-subheader>Share Medias</v-subheader>
    <v-list-item-group v-model="selectedMedia" color="primary">

      <v-dialog v-model="video" transition="expend-transition" persistent max-width="55%">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-movie</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                Share Video
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:default="dialog">
          <dialog-video-media v-if="video" v-on:close="closeDialog"/>
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
          <dialog-web-media v-if="web" :dialog="dialog" v-on:close="closeDialog"/>
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
import DialogVideoMedia from './video/DialogVideoMedia.vue';
import DialogWebMedia from './website/DialogWebMedia.vue';

export default {
  name: 'MenuMedia',
  components: {
    'dialog-video-media': DialogVideoMedia,
    'dialog-web-media': DialogWebMedia
  },
  props: {},
  data() {
    return {
      selectedMedia: [],
      video: false,
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
      if (value === null) {
        this.video = false;
        this.web = false;
        return;
      }

      switch (value) {
        case 0:
          this.video = true
          break;
        case 1:
          this.web = true
          break;
      }
    }
  },
  methods: {
    closeDialog() {
      this.selectedMedia = null;
      this.$emit('close');
    }
  }
}
</script>

<style scoped lang="scss">

</style>
