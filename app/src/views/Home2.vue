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
      <v-col cols="4" sm="4" lg="4">
        <dashboard-item dark title="" height="100%" class="mb-7 mycolor">
          <v-list-item two-line>
            <v-list-item-content>
              <v-list-item-title class="text-h5">
                San Francisco
              </v-list-item-title>
              <v-list-item-subtitle>Mon, 12:30 PM, Mostly sunny</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-card-text>
            <v-row align="center">
              <v-col class="text-h2" cols="6">
                23&deg;C
              </v-col>
              <v-col cols="6">
                <v-img src="https://cdn.vuetifyjs.com/images/cards/sun.png" alt="Sunny image" width="92"></v-img>
              </v-col>
            </v-row>
          </v-card-text>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-send</v-icon>
            </v-list-item-icon>
            <v-list-item-subtitle>23 km/h</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <v-list-item-icon>
              <v-icon>mdi-cloud-download</v-icon>
            </v-list-item-icon>
            <v-list-item-subtitle>48%</v-list-item-subtitle>
          </v-list-item>
        </dashboard-item>
      </v-col>

      <v-col cols="8" sm="8" lg="8" class="">
        <dashboard-calendar height="100%" class="">
        </dashboard-calendar>
      </v-col>
    </v-row>
    <v-row>

      <!-- COL 1-->
      <v-col cols="6" sm="6" lg="6" class="">
        <dashboard-item title="Meetings" class="mb-7">
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

      <!-- COL 3-->
      <v-col cols="12" sm="12" lg="6" class="">
        <dashboard-item title="Contacts" class="mb-7">
          <v-data-table :headers="headersUsers" :items="users" :items-per-page="5" class="elevation-1"></v-data-table>
        </dashboard-item>
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
import DashboardCalendar from '@../../../src/bundles/calendar-bundle/Resources/vue/components/DashbordCalendar';
import {
  Dashboard,
  DashLayout,
  DashItem
} from "vue-responsive-dash";
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
    dlayouts: [{
        breakpoint: "xl",
        numberOfCols: 12,
        items: [{
            id: "1",
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          {
            id: "2",
            x: 1,
            y: 0,
            width: 2,
            height: 1
          },
        ]
      },
      {
        breakpoint: "lg",
        breakpointWidth: 1200,
        numberOfCols: 10,
        items: [{
            id: "1",
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          {
            id: "2",
            x: 1,
            y: 0,
            width: 2,
            height: 1
          },
        ]
      },
      {
        breakpoint: "md",
        breakpointWidth: 996,
        numberOfCols: 8,
        items: [{
            id: "1",
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          {
            id: "2",
            x: 1,
            y: 0,
            width: 2,
            height: 1
          },
        ]
      },
      {
        breakpoint: "sm",
        breakpointWidth: 768,
        numberOfCols: 4,
        items: [{
            id: "1",
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          {
            id: "2",
            x: 1,
            y: 0,
            width: 2,
            height: 1
          },
        ]
      },
      {
        breakpoint: "xs",
        breakpointWidth: 480,
        numberOfCols: 2,
        items: [{
            id: "1",
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          {
            id: "2",
            x: 1,
            y: 0,
            width: 1,
            height: 1
          },
        ]
      },
      {
        breakpoint: "xxs",
        breakpointWidth: 0,
        numberOfCols: 1,
        items: [{
            id: "1",
            x: 0,
            y: 0,
            width: 1,
            height: 1
          },
          {
            id: "2",
            x: 0,
            y: 1,
            width: 1,
            height: 1
          }
        ]
      }
    ]
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
    position: relative;
    height: 100vh;
    width: 100%;
    /*display: flex;
    align-items: center;
    justify-content: center;*/
    /*background-image: url("../assets/chateau-if.jpg");*/
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
    background: linear-gradient(125.83deg , rgb(57, 45, 209) 0%, rgb(169, 27, 120) 99.09%);
    border-radius: 14px;
}
</style>
