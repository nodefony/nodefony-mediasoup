<template>
<v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
  <!--v-navigation-drawer v-model="drawer" app-->
  <v-list nav dense>
    <v-list-item @click="$router.push({ name: 'Home'})">
      <v-list-item-icon>
        <v-icon>mdi-home</v-icon>
      </v-list-item-icon>
      <v-list-item-title @click="$router.resolve({ name: 'About'})">Home</v-list-item-title>
    </v-list-item>
    <v-list-group :value="false" prepend-icon="mdi-google-classroom">
      <template v-slot:activator>
        <v-list-item-title>Mettings</v-list-item-title>
      </template>
      <v-list-item sub-group @click="$router.push({ name: 'Rooms'})">
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
      <v-list-item sub-group @click="$router.push({ name: 'RoomLayout'})">
        <v-list-item-title>
          Layout
        </v-list-item-title>
        <v-list-item-icon>
          <v-icon>mdi-home</v-icon>
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
    ...mapGetters({
      getDrawer: 'getDrawer'
    }),
    drawer: {
      get() {
        return this.getDrawer;
      },
      set(value) {
        return value
      }
    }
  },
  async mounted() {},
  async destroyed() {},
  methods: {}
}
</script>
