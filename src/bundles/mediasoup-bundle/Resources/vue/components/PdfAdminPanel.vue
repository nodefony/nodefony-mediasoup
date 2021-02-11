<template>
<v-card height="100%" flat tile elevation="0" class="d-flex flex-column">
  <v-card-text>
    <v-form v-if="!loading" autocomplete="on" lazy-validation v-model="formValid">
      <v-select required dense :items="availableMediaUrls" :label="$t('medias.media_url')" outlined v-model="formData.mediaUrl"></v-select>
      <v-select required dense :items="eventSamplingPossibilities" :label="$t('medias.events_per_second')" outlined v-model="formData.eventsPerSecond"></v-select>
      <v-select required dense disabled :items="controlPolicies" item-text="label" item-value="key" :label="$t('medias.control_policy')" outlined v-model="formData.controlPolicy"></v-select>
    </v-form>
  </v-card-text>
  <v-card-actions class="">
    <v-spacer></v-spacer>
    <v-btn class="ml-auto" @click="save" :disabled="!formValid">
      {{$t("save")}}
    </v-btn>
  </v-card-actions>
</v-card>
</template>

<script>
export default {
  name: 'PdfAdminPanel',
  props: {
    viewer: {
      type: Object
    },
    socketBinding: {
      type: Object
    }
  },
  data(vm) {
    return {
      eventSamplingPossibilities: [2, 5, 10, 30, 50, 100, 200],
      loading: true,
      formData: {
        mediaUrl: '',
        eventsPerSecond: 30,
        controlPolicy: ''
      },
      formValid: true,
      controlPolicies: [{
          key: 'automatic',
          label: 'Automatic'
        },
        {
          key: 'first',
          label: "First"
        }
      ],
      availableMediaUrls: [
        `https://${window.location.host}/app/pdf/vue-js-fr.pdf`,
        `https://${window.location.host}/app/pdf/RX-V685.pdf`
      ]
    }
  },
  mounted() {
    this.fillAdminForm(this.viewer.settings.data);
    this.initEvents();
    this.loading = false;
  },
  computed: {},
  methods: {
    save() {
      if (!this.formValid) {
        return;
      }
      const old_settings = Object.assign({}, this.viewer.settings.data);
      Object.assign(this.viewer.settings.data, this.formData);
      this.$emit('save', this.viewer.settings.data, old_settings);
    },
    fillAdminForm(settings) {
      Object.assign(this.formData, settings);
    },
    initEvents() {
      this.socketBinding.on("onSettings", (settings) => {
        if (settings) {
          this.fillAdminForm(settings);
        }
      });
    }
  }
}
</script>

<style scoped lang="scss">

</style>
