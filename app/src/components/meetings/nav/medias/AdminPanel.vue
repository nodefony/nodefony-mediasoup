<template>
<v-card v-bind="{...$props, ...$attrs}" height="100%" style="overflow-y:auto" flat tile>
  <v-card-text>
    <v-form v-model="formValid">
      <v-card-title>Media Informations</v-card-title>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field outlined dense v-model="mediaName" :disabled="loading" label="Name"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field outlined dense v-model="mediaTitle" :disabled="loading" label="Title"></v-text-field>
        </v-col>
      </v-row>
      <v-divider></v-divider>

      <v-card-title>Media URL</v-card-title>
      <v-row class="" align="center" justify="center">
        <v-col class="text-center">
          <v-text-field outlined dense :rules="urlRules" v-model="formData.mediaUrl" prefix="https://">
          </v-text-field>
          <iframe ref="iframe" v-if="!liteMode && !invalidUrl && formData.mediaUrl" importance="low" :src="`https://${formData.mediaUrl}`" style="width:75%;height:200px;border:none">
          </iframe>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <v-card-title v-if="items.length">Available Local Medias</v-card-title>
      <v-row v-if="items.length">
        <v-col cols="5">
          <v-subheader>Local Medias : </v-subheader>
        </v-col>
        <v-col cols="7">
          <v-select dense :items="items" outlined v-on:change="selectChange" label="Select Medias" v-model="availableMedia">
          </v-select>
        </v-col>
        <v-divider></v-divider>
      </v-row>


      <v-card-title>Media Share Configuration</v-card-title>
      <!-- slot prepend AdminPanel-->
      <slot name="AdminPanel" v-bind:formData="formData"> </slot>

      <!-- control_policy -->
      <v-row>
        <v-col cols="5">
          <v-subheader>{{$t('medias.control_policy')}}</v-subheader>
        </v-col>
        <v-col cols="7">
          <v-select required dense :items="controlPolicies" item-text="label" item-value="key" :label="$t('medias.control_policy')" outlined v-model="formData.controlPolicy"></v-select>
        </v-col>
      </v-row>
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
import {
  //mapGetters,
  //mapMutations,
  //mapActions
} from 'vuex';


export default {
  name: 'AdminPanel',
  components: {},
  props: {
    availableMediaUrls: Array,
    socketBinding: Object,
    liteMode: {
      type: Boolean,
      default: false
    },
    settings: {
      type: Object
    },
    allowedUrlRulesChecker: {
      type: Function
    }
  },
  data() {
    return {
      mediaName: '',
      mediaTitle: '',
      mediaUrl: '',
      invalidUrl: false,
      loading: false,
      formData: {
        name: '',
        title: '',
        mediaUrl: '',
        controlPolicy: 'automatic'
      },
      formValid: false,
      availableMedia: {
        name: '',
        title: '',
        mediaUrl: '',
      },
      controlPolicies: [{
          key: 'automatic',
          label: 'Automatic'
        },
        {
          key: 'admin_only_automatic',
          label: "Admin only (automatic)"
        }
      ],
      urlRules: [
        value => {
          let res = !!value;
          if (res) {
            const patternUrl = new RegExp('([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
            res = patternUrl.test(value);
            if (res && this.allowedUrlRulesChecker) {
              res = this.allowedUrlRulesChecker(value);
            }
          }
          this.invalidUrl = !res;
          return this.invalidUrl ? `Invalid url` : true;
        }
      ]
    }
  },
  destroyed() {
    if (this.$refs.iframe) {
      this.$refs.iframe.src = null;
    }
    if (this.socketBinding) {
      this.socketBinding.removeListener("onSettings", this.onSettings);
    }
  },
  mounted() {
    if (this.settings) {
      this.selectChange(this.settings);
    }
    if (this.socketBinding) {
      this.initEvents();
    }
  },
  computed: {
    items() {
      let myItems = []
      if (this.$nodefony.environment == "development" && this.availableMediaUrls && this.availableMediaUrls.length) {
        this.availableMediaUrls.map((obj) => {
          let item = {};
          item.text = obj.mediaUrl;
          item.value = obj;
          myItems.push(item)
        });
      }
      return myItems;
    }
  },
  watch: {
    mediaName(value) {
      this.formData.name = value;
      this.$emit("name", value);
    },
    mediaTitle(value) {
      this.formData.title = value;
      this.$emit("title", value);
    },
    loading(value) {
      this.$emit("loading", value);
    }
  },

  methods: {
    async save() {
      this.$emit("save", this.formData);
    },
    selectChange(obj) {
      this.mediaName = obj.name;
      this.mediaTitle = obj.title;
      this.formData.mediaUrl = obj.mediaUrl;
      this.formData.controlPolicy = obj.controlPolicy ? obj.controlPolicy : 'automatic';
      this.$emit("selectChange", this.formData);
    },
    initEvents() {
      this.onSettings = (settings) => {
        if (settings) {
          this.selectChange(settings);
        }
      };
      this.socketBinding.on("onSettings", this.onSettings);
    }
  }

}
</script>

<style scoped lang="scss">

</style>
