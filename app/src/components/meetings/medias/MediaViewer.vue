<template>
<v-card width=100% height="100%" tile elevation="4" outlined :loading="loading" class="" style="">

  <v-card-title color="blue-grey" dark class="title font-weight-regular justify-space-between">
    <v-icon x-large class="mr-5">mdi-blur</v-icon>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">Name Media</v-list-item-title>
          <v-list-item-subtitle class="text-capitalize">{{type}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-spacer></v-spacer>

    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> Nane Surname
          </v-list-item-title>
          <v-list-item-subtitle>handy User</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-spacer></v-spacer>

    <v-btn icon v-if="!lockedAdminPanel" :disabled="lockedAdminPanel === null" :color="toggleAdminPanel ? 'blue-grey' : ''" @click="toggleAdminPanel = !toggleAdminPanel">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
  </v-card-title>
  <v-container fluid style="height:100%;width:100%">

    <v-row style="height:100%;width:100%">
      <v-col style="height:100%;width:100%">
        <slot name="media" :type="type"></slot>
      </v-col>
      <v-slide-x-reverse-transition>
        <v-col md="2" height="100%" v-show="toggleAdminPanel">
          <v-card height="100%" flat tile elevation="0" class="d-flex flex-column">
            <v-card-title>{{$t("congig")}}</v-card-title>



            <slot name="AdminPanel"> </slot>
          </v-card>
        </v-col>
      </v-slide-x-reverse-transition>
    </v-row>
  </v-container>
</v-card>
</template>

<script>
export default {
  name: 'MediaViewer',
  components: {

  },
  props: {
    roomid: {
      type: String
    },
    type: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      message: null,
      toggleAdminPanel: false,
      lockedAdminPanel: false
    };
  },
  mounted() {
    this.message = this.log("load media");
  },
  watch: {
    message(pdu) {
      this.notify(pdu);
    }
  },
  computed: {},

  methods: {}
}
</script>

<style scoped lang="scss">

</style>
