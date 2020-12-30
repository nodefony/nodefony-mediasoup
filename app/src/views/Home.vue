<template>
<v-container fluid>
  <v-row justify="center" align="center" class="mt-10">
    <img alt="Vue logo" src="../assets/nodefony.png">
  </v-row>
</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
// @ is an alias to /src

export default {
  name: 'Home',
  props: {},
  components: {},
  mounted() {
    this.openNavBar();
  },
  updated() {
    //console.log("home updated")
  },
  methods: {
    ...mapMutations([
      //'closeDrawer',
      //'openDrawer',
      'openNavBar',
      //'closeNavBar'
    ]),
  }
}
</script>
