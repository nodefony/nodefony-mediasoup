<template>
<v-window class="nodefony--background">
  <v-container fluid class="px-10">
    <v-row>
      <!-- COL 1-->
      <v-col cols="12" sm="3">
        <!--dashboard-item v-if="isAuthenticated" title="Meetings">
      </dashboard-item-->
      </v-col>
      <!-- COL 2-->
      <v-col cols="12" sm="6">
        <v-row justify="center" align="center" class="mt-10">
          <img src="../assets/mediasoup.png">
        </v-row>
        <v-row justify="center" align="center" class="mt-10">

          <div class="text-h2 teal--text text--lighten-4"> MEDIASOUP</div>
        </v-row>
        <v-row justify="center" align="center" class="mt-10">
          <div class="text-h4 teal--text text--lighten-2"> FSU </div>
        </v-row>
      </v-col>

      <!-- COL 3-->
      <v-col cols="12" sm="3">
        <!--dashboard-item v-if="isAuthenticated" :title="$t('users.users')">

        </dashboard-item-->
      </v-col>
    </v-row>

  </v-container>
</v-window>
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

<style lang="scss">
.nodefony--background {
    position: relative;
    height: 100vh;
    width: 100%;
    /*display: flex;
    align-items: center;
    justify-content: center;*/
    background-image: url("../assets/chateau-if.jpg");
    background-size: cover;
    overflow: hidden;
}

.nodefony--background::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.65);
}
</style>
