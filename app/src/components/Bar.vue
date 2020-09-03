<template>
<v-app-bar :clipped-left="$vuetify.breakpoint.lgAndUp" app color="" dark>
  <v-app-bar-nav-icon @click.stop="toogleDrawer"></v-app-bar-nav-icon>
  <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
    <span class="hidden-sm-and-down">Nodefony Mediasoup FSU</span>
  </v-toolbar-title>

  <v-spacer></v-spacer>
  <v-btn icon>
    <v-icon>mdi-apps</v-icon>
  </v-btn>
  <v-btn icon>
    <v-icon>mdi-bell</v-icon>
  </v-btn>
  <v-btn icon v-if="isAuthenticated">
    <v-avatar color="blue-grey" size="32">
      <span class="white--text">{{getTrigramme}}</span>
    </v-avatar>
  </v-btn>
</v-app-bar>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'Bar',
  components: {},
  props: {

  },
  data(vm) {
    return {

    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getTrigramme'
    ])
  },
  async beforeMount() {
    if (!this.getProfile) {
      return await this.getUserProfile(`/api/users/${this.getUser}`)
    }
  },
  methods: {
    ...mapActions({
      getUserProfile: 'USER_REQUEST'
    }),
    ...mapMutations(['toogleDrawer'])
  }
}
</script>
