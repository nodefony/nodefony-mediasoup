<template>
<v-container fluid class="pa-0">
  <v-window class="nodefony--background overflow-auto">

    <v-sheet v-if="!isAuthenticated" height="fill-height" class="ma-5" color="transparent">
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
    </v-sheet>

    <v-sheet v-if="isAuthenticated" height="fill-height" class="ma-5" color="transparent">
      <v-row class="">
        <v-col cols="12" sm="12" class="pa-2">
          <dashboard-calendar height="300px" title="Calendar">
          </dashboard-calendar>
        </v-col>
      </v-row>

      <v-row class="pa-3">
        <!-- COL 1-->
        <v-col cols="12" sm="6" class="pa-2">
          <dashboard-item height="200" title="Meetings">
            <v-data-table fixed-header :loading="loading" :headers="headersRooms" :items="meetings" :items-per-page="15" class="elevation-2" :headers-length="30" :search="search">

              <template v-slot:item.id="{ item }">
                <v-btn x-small class="mr-2 mt-1" @click="redirect(item.id)">{{item.id}}</v-btn>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-icon small class="mr-2" @click="">
                  mdi-eye
                </v-icon>
                <v-icon v-if="true" small class="mr-2" @click="">
                  mdi-delete
                </v-icon>
              </template>
              <template v-slot:no-data>
              </template>
            </v-data-table>

          </dashboard-item>
        </v-col>
        <!-- COL 2-->
        <!--v-col cols="12" sm="4">
        <v-row justify="center" align="center" class="mt-10">
          <img src="../assets/mediasoup.png">
        </v-row>
        <v-row justify="center" align="center" class="mt-10">
          <div class="text-h2 teal--text text--lighten-4"> MEDIASOUP</div>
        </v-row>

        <dashboard-calendar class="my-5" v-if="isAuthenticated" title="Meetings">
        </dashboard-calendar>
      </v-col-->

        <!-- COL 3-->
        <v-col cols="12" sm="6" class="pa-3">
          <dashboard-item title="Contacts">
            <v-data-table :headers="headersUsers" :items="users" :items-per-page="5" class="elevation-1"></v-data-table>
          </dashboard-item>
        </v-col>
      </v-row>

    </v-sheet>
  </v-window>
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
import DashboardCalendar from '@../../../src/bundles/calendar-bundle/Resources/vue/components/DashbordCalendar';
export default {
  name: 'Home',
  props: {},
  components: {
    "dashboard-item": DashboardItem,
    "dashboard-calendar": DashboardCalendar
  },
  data: () => ({
    search: "",
    loading: false,
    users: [],
    meetings: [],

  }),

  async mounted() {
    this.openNavBar();
    await this.getMeetings();
    await this.getUsers();
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
    headersUsers() {
      return [{
          text: 'Username',
          align: 'start',
          sortable: false,
          value: 'username',
        },
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Surname',
          value: 'surname'
        },
        {
          text: 'email',
          value: 'email'
        },
        {
          text: 'Roles',
          value: 'Role'
        }
      ]
    },
    headersRooms() {
      return [{
        text: this.$t("rooms.room"),
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "Closed",
        value: 'closed'
      }, {
        text: this.$t("rooms.peers"),
        value: 'status.peers'
      }, {
        text: "Worker (pid)",
        value: 'status.worker.pid'
      }, {
        text: "Router (id)",
        value: 'status.router.id'
      }, {
        text: "Broadcasters",
        value: 'status.broadcasters'
      }, {
        text: "",
        value: 'actions',
        sortable: false
      }]
    }
  },
  methods: {
    ...mapActions([
      "getAllUsers"
    ]),
    ...mapMutations([
      //'closeDrawer',
      //'openDrawer',
      'openNavBar',
      //'closeNavBar'
    ]),
    async getMeetings() {
      return this.$mediasoup.request("meetings")
        .then((data) => {
          //this.countall = data.result.count;
          this.meetings = data.result.rows
        })
        .catch(e => {
          this.log(e, "ERROR");
          this.loading = false;
          throw e
        })
    },
    async getUsers() {
      return await this.getAllUsers()
        .then((ele) => {
          this.users = ele.result.rows;
        })
        .catch((e) => {
          console.log(e)
        });
    },
    redirect(roomid) {
      return this.$router.push({
          name: "HomeMeeting",
          params: {
            roomid: roomid
          }
        })
        .catch(() => {})
    },

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
