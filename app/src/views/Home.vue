<template>
<v-window class="nodefony--background overflow-auto">

  <v-toolbar dark elevation="4" color="#1a242d" class="fixed-bar mb-3">
    <v-icon>mdi-home</v-icon>
    <v-toolbar-title class="mx-5">
      Dashboard
    </v-toolbar-title>
  </v-toolbar>

  <v-sheet v-if="isAuthenticated" class="ma-5 mt-15" color="transparent">

    <v-row class="mt-3">
      <v-col cols="4" sm="4" lg="4" xs="12">
        <town-card dark class="mb-7 fill-height">
        </town-card>
      </v-col>

      <v-col cols="8">
        <v-row>
          <v-col cols="12" xs="12">
            <dashboard-calendar>
            </dashboard-calendar>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6" xs="12">
            <dashboard-item title="Meetings" class="mb-7 fill-height">
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

          <v-col class="fill-height" cols="6" xs="12">
            <dashboard-item title="Contacts" class="mb-7 fill-height">
              <v-data-table :headers="headersUsers" :items="users" :items-per-page="5" class="elevation-1"></v-data-table>
            </dashboard-item>
          </v-col>
        </v-row>

      </v-col>
    </v-row>
  </v-sheet>
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
import TownCard from "@/components/dashboard/TownCard";
import DashboardCalendar from '@../../../src/bundles/calendar-bundle/Resources/vue/components/DashbordCalendar';
export default {
  name: 'Home',
  props: {},
  components: {
    "dashboard-item": DashboardItem,
    "dashboard-calendar": DashboardCalendar,
    "town-card": TownCard
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
.fixed-bar {
    position: fixed;
    width: 100%;
    margin-bottom: 30px;
    /* for Safari */
    z-index: 2;
}
.nodefony--background {
    /*position: relative;
    height: 100vh;
    width: 100%;*/
    /*display: flex;
    align-items: center;
    justify-content: center;*/
    /*background-image: url("../assets/chateau-if.jpg");*/
    height: 100%;
    width: 100%;
    background-color: #1a242d;
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
.mycolor {
    background: linear-gradient(125.83deg , rgb(95, 95, 126) 0%, rgb(26, 36, 45) 85.09%);
}
.mycolor2 {
    background: linear-gradient(200.83deg , rgb(95, 95, 126) 0%, rgb(26, 36, 45) 85.09%);
}
</style>
