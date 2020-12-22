<template>
<v-system-bar color="teal lighten-1" lights-out>
  <v-spacer></v-spacer>
  <v-icon>mdi-wifi-strength-4</v-icon>
  <v-icon>mdi-signal-cellular-outline</v-icon>
  <v-icon>mdi-battery</v-icon>
  <span>{{ clock }}</span>
</v-system-bar>
</template>


<script>
import {
  mapGetters
} from 'vuex';
export default {
  name: 'RoomSystemBar',
  data(vm) {
    return {

    }
  },
  computed: {
    ...mapGetters({
      clock: 'getClock'
    })
  },
  mount() {},
  methods: {

  },
}
</script>

<style scoped lang="scss">
.v-system-bar {
    z-index: 1;
    position: fixed;
    width: 100%;
    top: 0;
}
</style>
