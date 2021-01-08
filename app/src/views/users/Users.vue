<template>
<v-window style="background-color:#f2f5f8;">
  <v-container v-show="!selectedUser" fluid class="ma-0 pa-0">
    <v-toolbar fixed outlined width="100%" color="blue-grey" dark flat style="top: 64px;position:fixed;">

      <v-icon class="mr-5">mdi-account</v-icon>
      <v-toolbar-title class="mx-5"> {{$t('users.users')}}</v-toolbar-title>

      <v-spacer></v-spacer>

    </v-toolbar>
    <v-layout class="" v-if="layout==='table'" style='margin-top:64px;'>
      <v-container fluid class="ma-5">
        <v-card-title>
          {{$t('users.users')}}
          <v-btn v-if="isAdmin" x-small class="ml-5" color="grey" @click="selectUser({}, true)">Create</v-btn>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table dense fixed-header height="520" :loading="loading" :headers="headers" :items="users" :items-per-page="15" class="elevation-2" :headers-length="30" :search="search">

          <template v-slot:item.actions="{ item }">
            <v-icon v-if="isAdmin || isMe(item.username)" small class="mr-2" @click="selectUser(item)">
              mdi-open-in-new
            </v-icon>
            <v-icon v-else small class="mr-2" @click="selectUser(item)">
              mdi-eye
            </v-icon>
            <v-icon v-if="isAdmin || isMe(item.username)" small class="mr-2" @click="deleteUser(item)">
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:item.roles="{ item }">
            <v-chip x-small v-for="role in item.roles" :key="role" dark>
              {{ role }}
            </v-chip>
          </template>
          <template v-slot:item.rooms="{ item }">
            <v-chip x-small v-for="room in item.rooms" :key="room.name" dark>
              {{ room.name }}
            </v-chip>
          </template>
          <template v-slot:no-data>
          </template>
        </v-data-table>
      </v-container>
    </v-layout>
    <v-layout v-if="layout==='grid'">
      <h1>TODO</h1>
    </v-layout>
  </v-container>
  <v-container v-show="selectedUser" style="background-color:#f2f5f8" fluid>
    <user-edit :user="selectedUser" :create="create" class="mt-5" ref="selectedUser" v-on:close="closeUser" v-on:remove="deleteUserIndex" />
  </v-container>
</v-window>
</template>

<script>
import {
  mapGetters
  //mapMutations,
  //mapActions
} from 'vuex';

import EditUser from '@/views/users/EditUser'
export default {
  name: 'Users',
  components: {
    "user-edit": EditUser
  },
  props: {},
  data(vm) {
    return {
      loading: true,
      users: [],
      selectedUser: null,
      layout: "table",
      create: false,
      search: ""
    }
  },
  beforeRouteUpdate(to, from, next) {
    //console.log("beforeRouteUpdate")
    return next();
  },
  beforeRouteLeave(to, from, next) {
    //console.log("beforeRouteLeave", to, from)
    return next();
  },
  beforeRouteEnter(to, from, next) {
    //console.log("beforeRouteEnter", to, from)
    return next();
  },
  mounted() {
    this.getUsers();
  },
  computed: {
    ...mapGetters([
      'hasRole',
      'getProfileUsername'
    ]),
    isAdmin() {
      return this.hasRole("ROLE_ADMIN")
    },

    headers() {
      return [{
        text: this.$t("users.users"),
        align: 'start',
        sortable: true,
        value: 'username'
      }, {
        text: this.$t("users.name"),
        value: 'name'
      }, {
        text: this.$t("users.surname"),
        value: 'surname'
      }, {
        text: this.$t("users.locale"),
        value: 'lang'
      }, {
        text: this.$t("users.roles"),
        value: 'roles'
      }, {
        text: this.$t("rooms.name"),
        value: 'rooms'
      }, {
        text: "",
        value: 'actions',
        sortable: false
      }, ]
    }
  },
  destroyed() {},
  beforeMount() {},
  methods: {
    isMe(username) {
      return username === this.getProfileUsername;
    },
    async getUsers() {
      this.loading = true;
      return this.$nodefony.request("users")
        .then((data) => {
          this.users = data.result.rows
          this.loading = false;
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.log(e, "ERROR");
        })
    },

    deleteUserIndex(user) {
      const res = this.users.findIndex((ele, index) => {
        if (ele.username === user.username) {
          return index;
        }
      });
      if (res >= 0) {
        this.users.splice(res, 1);
        this.log(`Delete ${user.username} index ${res} `, "DEBUG");
      }
      return null;
    },
    selectUser(item, create = false) {
      if (create) {
        this.selectedUser = item;
        this.create = create;
      } else {
        return this.$router.push({
          name: 'User',
          params: {
            username: item.username
          }
        });
      }

    },
    closeUser() {
      this.selectedUser = null;
    },
    deleteUser(item) {
      return this.$refs["selectedUser"].deleteUser(item.username)
        .then((user) => {
          this.deleteUserIndex(user);
          return user;
        }).catch((e) => {
          this.log(e, "ERROR");
        });
    }
  }

}
</script>


<style scoped>
.enabled {
  background-color: red;
  opacity: 0.3;
}
</style>
