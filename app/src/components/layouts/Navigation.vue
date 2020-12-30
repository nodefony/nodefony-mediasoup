<template>
<v-navigation-drawer disable-resize-watcher v-model="drawer" :clipped="false" app>
  <!-- $vuetify.breakpoint.lgAndUp-->
  <v-card v-if="isAuthenticated" height="64">
    <v-list dense>
      <v-list-item>
        <v-list-item-avatar color="blue-grey">
          <!--img src="" alt=""-->
          <span class="white--text">{{getTrigramme}}</span>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{getProfileName}}</v-list-item-title>
          <v-list-item-subtitle>{{getProfileSurname}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-card>

  <v-list nav dense>
    <v-list-item @click="redirect('Home')">
      <v-list-item-icon>
        <v-icon>mdi-home</v-icon>
      </v-list-item-icon>
      <v-list-item-title @click="$router.resolve({ name: 'About'})">Home</v-list-item-title>
    </v-list-item>
    <v-list-group v-if="isAuthenticated" :value="false" prepend-icon="mdi-google-classroom">
      <template v-slot:activator>
        <v-list-item-title>Mettings</v-list-item-title>
      </template>
      <v-list-item sub-group @click="redirect('Rooms')">
        <v-list-item-title>
          Rooms
        </v-list-item-title>
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
        </v-list-item-icon>
      </v-list-item>
      <v-list-item sub-group>
        <v-list-item-content>
          <v-list-item-title>
            Create Room
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon>mdi-plus-outline</v-icon>
        </v-list-item-icon>
      </v-list-item>

    </v-list-group>
  </v-list>
  <!--v-list nav dense>
    <v-list-item link>
      <v-list-item-icon>
        <v-icon>mdi-google-classroom</v-icon>
      </v-list-item-icon>
      <v-list-item-title>Rooms</v-list-item-title>
    </v-list-item>
    <v-list-item link>
      <v-list-item-action @click="$router.resolve({ name: 'Rooms'})">
        <v-icon>mdi-google-classroom</v-icon>
      </v-list-item-action>

      <v-list-item-content>
        <v-list-item-title @click="$router.resolve({ name: 'Rooms'})">
          <a :href="$router.resolve({ name: 'Rooms' }).href"></a>
          Rooms
        </v-list-item-title>
      </v-list-item-content>

    </v-list-item>
  </v-list-->
</v-navigation-drawer>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: 'Navigation',
  components: {},
  props: {},
  data(vm) {
    return {}
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getTrigramme',
      'getDrawer',
      'getProfileName',
      'getProfileSurname'
    ]),
    drawer: {
      get() {
        return this.getDrawer;
      },
      set(value) {
        return value
      }
    }
  },
  async mounted() {
    //console.log(this.$vuetify.breakpoint)
  },
  async destroyed() {},
  methods: {
    redirect(route) {
      return this.$router.push({
          name: route
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">

</style>
