<template>
<v-card v-bind="{...$props, ...$attrs}" height="100%" flat tile>
  <v-card-text>
    <v-form>
      <v-card-title>Medias Informations</v-card-title>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field outlined dense v-model="mediaName" :disabled="loading" label="Name"></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field outlined dense v-model="mediaTitle" :disabled="loading" label="Title"></v-text-field>
        </v-col>
      </v-row>
      <v-divider></v-divider>

      <v-card-title>Choice Media to add </v-card-title>
      <v-row class="" align="center" justify="center">
        <v-col class="text-center">
          <v-text-field outlined dense :rules="urlRules" v-model="formData.mediaUrl" prefix="https://">
          </v-text-field>
          <iframe ref="iframe" v-if="!invalidUrl && formData.mediaUrl" importance="low" :src="`https://${formData.mediaUrl}`" style="width:75%;height:200px;border:none">
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


      <v-card-title>Medias Share Configuration</v-card-title>
      <!-- slot prepend AdminPanel-->
      <slot name="AdminPanel" v-bind:formData="formData"> </slot>

      <!-- control_policy -->
      <v-row>
        <v-col cols="5">
          <v-subheader>{{$t('medias.control_policy')}}</v-subheader>
        </v-col>
        <v-col cols="7">
          <v-select required dense disabled :items="controlPolicies" item-text="label" item-value="key" :label="$t('medias.control_policy')" outlined v-model="formData.controlPolicy"></v-select>
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
    availableMediaUrls: Array
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
        controlPolicy: ''
      },
      formValid: true,
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
          key: 'first',
          label: "First"
        }
      ],
      urlRules: [
        value => {
          if (value) {
            const patternUrl = new RegExp('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
            let res = patternUrl.test(value);
            if (!res) {
              this.invalidUrl = true
              return 'Invalid url.';
            }
          }
          this.invalidUrl = false
          return true;
        }
      ]
    }
  },
  destroyed() {
    if (this.$refs.iframe) {
      this.$refs.iframe.src = null;
    }
  },
  mounted() {},
  computed: {

    items() {
      let myItems = []
      if (this.availableMediaUrls && this.availableMediaUrls.length) {
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
    save() {
      this.$emit("save", this.formData);
    },
    selectChange(obj) {
      this.mediaName = obj.name;
      this.mediaTitle = obj.title;
      Object.assign(this.formData, obj);
      this.$emit("selectChange", this.formData);
    }
  }

}
</script>

<style scoped lang="scss">

</style>
