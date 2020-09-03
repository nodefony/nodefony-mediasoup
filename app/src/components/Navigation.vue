<template>
<v-navigation-drawer v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app>
  <v-list dense>
    <v-list-item link>
      <v-list-item-action>
        <v-icon>mdi-history</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>
          <router-link :to="{ name: 'MettingAuth' ,params: { roomid: 'test'}}" tag="div">
            <v-list-item-content>
              <v-list-item-title>Room</v-list-item-title>
            </v-list-item-content>
          </router-link>
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</v-navigation-drawer>
</template>

<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: 'Navigation',
  components: {},
  props: {

  },
  data(vm) {
    return {

    }
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
  methods: {}
}
</script>
