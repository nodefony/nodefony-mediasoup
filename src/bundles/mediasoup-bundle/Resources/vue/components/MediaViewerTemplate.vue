<template>
<v-card width=100% height="100%" tile elevation="4" outlined :loading="loading" class="" style="">

  <v-card-title color="blue-grey" dark class="title font-weight-regular justify-space-between">
    <v-icon x-large class="mr-5">mdi-blur</v-icon>
    <v-list dense>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">Media</v-list-item-title>
          <v-list-item-subtitle class="text-capitalize">{{type}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-spacer></v-spacer>

    <v-list dense>
      <v-list-item>
        <v-list-item-content style="text-align: center;">
          <!--v-list-item-title class="text-h6">Name</v-list-item-title-->
          <v-list-item-subtitle class="text-capitalize">{{currentController.name}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-spacer></v-spacer>

    <v-btn icon v-if="!lockedAdminPanel" :disabled="lockedAdminPanel === null" :color="toggleAdminPanel ? 'blue-grey' : ''" @click="toggleAdminPanel = !toggleAdminPanel">
      <v-icon>mdi-cog</v-icon>
    </v-btn>

    <v-btn icon @click="forceRerenderMedia">
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
    
    <v-btn icon @click="closeMedia">
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-badge :value="controlOther" :color="controlColor" :content="currentController.name" left transition="scale-transition" class="text-capitalize">
      <v-btn x-small color="blue-grey" class="white--text" fab :disabled="true">
        <v-icon v-if="controlOwn" small :color="socketActivityColor" dark>mdi-hand-right</v-icon>
        <v-icon v-if="controlOther" small :color="socketActivityColor" dark>mdi-lock</v-icon>
        <v-icon v-if="controlNone" small :color="socketActivityColor" dark>mdi-cloud-download</v-icon>
      </v-btn>
    </v-badge>
  </v-card-title>
  <v-container fluid style="height:100%;width:100%">

    <v-row style="height:100%;width:100%">
      <v-col style="height:100%;width:100%">
        <slot name="media" :type="type"></slot>
      </v-col>
      <v-slide-x-reverse-transition>
        <v-col md="4" height="100%" v-show="toggleAdminPanel">
          <slot name="AdminPanel"> </slot>
        </v-col>
      </v-slide-x-reverse-transition>
    </v-row>
  </v-container>
</v-card>
</template>

<script>
import {
  //mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';
import Controls from '../mediaviewer/control.js'

export default {
  name: 'MediaViewerTemplate',
  components: {},
  props: {
    type: {
      type: String
    },
    socketBinding: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      message: null,
      toggleAdminPanel: false,
      lockedAdminPanel: false,
      currentController: {
        name: '',
        id: null,
        type: Controls.NONE
      },
      activityMeter: null,
      events: null
    };
  },
  async mounted() {
    this.initEvents();
    this.$emit("connected");
    this.loading = false;
  },
  beforeDestroy() {
    this.closeMedia();
  },
  watch: {
    message(pdu) {
      this.notify(pdu);
    }
  },
  computed: {
    socketActivityColor() {
      if (!this.activityMeter) {
        return 'white';
      }
      return this.controlColor;
    },
    controlColor() {
      if (!this.currentController) {
        return 'blue';
      }
      return this.currentController.type == Controls.OTHER ? 'red lighten-2' : 'blue';
    },
    controlOwn() {
      return this.currentController.type == Controls.OWN;
    },
    controlOther() {
      return this.currentController.type == Controls.OTHER;
    },
    controlNone() {
      return this.currentController.type == Controls.NONE;
    }
  },
  methods: {
    ...mapMutations([
      'hideMediaLayout'
    ]),
    triggerActivityMeter() {
      if (this.activityMeter) {
        clearTimeout(this.activityMeter);
        this.activityMeter = null;
      }
      this.activityMeter = setTimeout(() => {
        clearTimeout(this.activityMeter);
        this.activityMeter = null;
      }, 100);
    },
    initEvents() {
      this.events = new Map([
        ["onSendMessage", this.triggerActivityMeter.bind(this)],
        ["onMessage", this.triggerActivityMeter.bind(this)],
        ["onControlChange", (controller_id, control, peer_data) => {
          this.currentController.type = control;
          this.currentController.id = controller_id;
          this.currentController.name = peer_data ? (peer_data.surname + " " + peer_data.name) : '';
        }]
      ]);

      for (const [name, listener] of this.events) {
        this.socketBinding.on(name, listener);
      }
    },
    forceRerenderMedia() {
      this.loading = true;
      this.$nextTick().then(() => {
        this.loading = false;
        this.$emit("connected");
      });
    },
    closeMedia() {
      for (const [name, listener] of this.events) {
        this.socketBinding.removeListener(name, listener);
      }
      this.hideMediaLayout();
    }
  }
}
</script>

<style scoped lang="scss">

</style>
