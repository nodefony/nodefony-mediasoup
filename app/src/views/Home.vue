<template>
<v-container fluid class="px-10">

  <v-row>
    <!-- COL 1-->
    <v-col cols="12" sm="4">
      <!--dashboard-item v-if="isAuthenticated" title="Meetings">
      </dashboard-item-->
    </v-col>
    <!-- COL 2-->
    <v-col cols="12" sm="4">
      <v-row justify="center" align="center" class="mt-10">

        <img alt="Vue logo" src="../assets/nodefony.png">
        <div class="text-h2"> Meetings </div>
      </v-row>
    </v-col>

    <!-- COL 3-->
    <v-col cols="12" sm="4">
      <!--dashboard-item v-if="isAuthenticated" :title="$t('users.users')">

      </dashboard-item-->
    </v-col>
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
import DashboardItem from "@/components/dashboard/DashboardItem";
export default {
  name: 'Home',
  props: {},
  components: {
    "dashboard-item": DashboardItem
  },
  mounted() {
    this.openNavBar();
  },
  updated() {
    //console.log("home updated")
  },
  computed: {
    ...mapGetters([
      'hasRole',
      'getProfileUsername',
      'isAuthenticated'
    ]),
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
