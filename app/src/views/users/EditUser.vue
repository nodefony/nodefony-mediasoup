<template>
<v-window>
  <v-card v-if="currentUser || creating" tile class="mb-10 scroll" style="background:transparent">

    <v-toolbar extended prominent color="blue-grey" dark>
      <v-icon x-large class="mr-5">mdi-account</v-icon>
      <v-toolbar-title v-if="currentUser"> {{ currentUser.username || ""}}
        <v-btn v-if="(hasRoleAdmin || isMe)" class="ml-10" small @click="editing=!editing;tab =0" color="teal">
          <v-icon small left>mdi-pencil</v-icon>
          Edit
        </v-btn>
        <v-spacer></v-spacer>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn v-if="user" icon>
        <v-icon @click="close">mdi-close</v-icon>
      </v-btn>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title v-on:change="editing=false">
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab :disabled="false" ref="user" @click="editing=false">
            {{ $t(`users.info`) }}
          </v-tab>
          <v-tab v-if="!creating && (hasRoleAdmin || isMe)" :disabled="creating" ref="danger">
            ZONE DANGER
          </v-tab>
          <v-tab v-if="!creating && hasRoleAdmin" :disabled="creating" ref="rooms">
            ZONE ROOMS
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-progress-linear indeterminate v-if="loading" value="18"></v-progress-linear>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat tile>
          <v-container fluid>
            <v-list v-if="currentUser && !creating && !editing">

              <v-list-item v-if="currentUser">
                <v-list-item-content>
                  <v-list-item-title>{{currentUser.username}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("users.user")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="currentUser">
                <v-list-item-content>
                  <v-list-item-title>{{currentUser.name}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("users.name")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="currentUser">
                <v-list-item-content>
                  <v-list-item-title>{{currentUser.surname}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("users.surname")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-divider></v-divider>

              <v-list-item v-if="currentUser">
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-email
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>{{currentUser.email}}</v-list-item-title>
                  <v-list-item-subtitle>Email</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-phone
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{$t('no-specified')}}</v-list-item-title>
                  <v-list-item-subtitle>Mobile</v-list-item-subtitle>
                </v-list-item-content>

              </v-list-item>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-map-marker
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>{{$t('no-specified')}}</v-list-item-title>
                  <v-list-item-subtitle>Adress</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>

              <v-list-item v-if="currentUser">
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-shield-account
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-chip x-small v-for="role in currentUser.roles" :key="`${role}-chip`">
                      {{ role }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>Roles</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="currentUser">
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-shield-account
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-chip x-small v-for="room in currentUser.rooms" :key="`${room.name}-chip`">
                      {{ room.name }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>Rooms</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

            </v-list>
          </v-container>


          <!-- edit -->
          <v-container v-if="(creating || editing) && (hasRoleAdmin || isMe)" fluid>
            <form autocomplete="on">
              <!--v-card-text-->
              <v-row class="mt-3">
                <v-col cols="3">
                  <v-subheader>Username</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-text-field :disabled="!creating" dense label="Username" v-model="results.username"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="3">
                  <v-subheader>Name</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-text-field dense label="Name" v-model="results.name"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="3">
                  <v-subheader>Surname</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-text-field dense label="Surname" v-model="results.surname"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="3">
                  <v-subheader>Email</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-text-field dense label="Email" v-model="results.email"></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <v-row>
                <v-col cols="3">
                  <v-subheader>Language</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-select v-model="results.lang" :items="states" append-outer-icon="mdi-map" menu-props="auto" hide-details label="Select" single-line></v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="3">
                  <v-subheader>Genre</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-radio-group v-model="results.gender" row>
                    <v-radio label="Male" value="male"></v-radio>
                    <v-radio label="Female" value="female"></v-radio>
                    <v-radio label="None" value="none"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <v-row v-if='hasRoleAdmin'>
                <v-col cols="3">
                  <v-subheader>Roles</v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-combobox v-model="results.roles" :items="roles" label="I use a scoped slot" multiple chips>
                    <template v-slot:selection="data">
                      <v-chip :key="JSON.stringify(data.item)" v-bind="data.attrs" :input-value="data.selected" :disabled="data.disabled" @click:close="data.parent.selectItem(data.item)">
                        <v-avatar class="accent white--text" left v-text="data.item.slice(0, 1).toUpperCase()"></v-avatar>
                        {{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-col>
                <v-divider class="my-3"></v-divider>
              </v-row>

              <v-row v-if='hasRoleAdmin'>
                <v-col cols="3">
                  <v-subheader>Enable User </v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-switch v-model="results.enabled" :label="`Enable`"></v-switch>
                </v-col>
                <v-divider class="my-2"></v-divider>
              </v-row>

              <div v-if="creating">
                <v-text-field v-show="false" autocomplete="username" name="username" :value="results.username"></v-text-field>
                <v-row>
                  <v-col cols="3">
                    <v-subheader>Password</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field v-model="results.password" autocomplete="new-password" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]" :type="show1 ? 'text' : 'password'" name="password" label="Password" hint="At least 8 characters"
                      counter @click:append="show1 = !show1"></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="3">
                    <v-subheader>Confirm Password</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field v-model="results.confirm" autocomplete="new-password" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]" :type="show2 ? 'text' : 'password'" name="confirm" label="Confirm Password"
                      hint="At least 8 characters" counter @click:append="show2 = !show2"></v-text-field>
                  </v-col>
                </v-row>
                <v-divider class="my-2"></v-divider>
              </div>
            </form>
            <!--/v-card-text-->

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn v-if="creating" depressed @click="addUser">
                Create
              </v-btn>
              <v-btn v-else depressed @click="save">
                Save
              </v-btn>
            </v-card-actions>
          </v-container>
        </v-card>
      </v-tab-item>

      <!-- DANGER ZONE -->
      <v-tab-item>
        <v-card tile>
          <v-container v-if='currentUser && (hasRoleAdmin || isMe)' fluid class="pa-0 ma-0 my-3">
            <v-card-title class="red--text">Danger Zone</v-card-title>

            <v-alert v-if="(currentUser && !currentUser.enabled)" class="mx-10 mt-10 px-5" icon="mdi-account" border="bottom" prominent colored-border type="warning" elevation="2">
              <v-card-title>
                User Disabled
              </v-card-title>
              <v-card-subtitle>
                This user has been disabled! Login accesss has been revoked.
              </v-card-subtitle>
              <v-btn @click="enableUser(currentUser.username)">
                <v-icon @click="true">mdi-account-check</v-icon>
                enable
              </v-btn>
            </v-alert>
            <v-banner v-if='(hasRoleAdmin && userHasRoleAdmin) || (isMe && userHasRoleAdmin)' single-line tile>
              Remove Admin access to {{ currentUser.username }}
              <template v-slot:actions>
                <v-btn color="white--text red accent-4" @click="changeRole(currentUser.username, currentUser.roles)">
                  <v-icon left dark>
                    mdi-security
                  </v-icon>
                  Remove Admin access
                </v-btn>
              </template>
            </v-banner>

            <v-banner v-if='hasRoleAdmin' two-line tile>
              Delete the user {{ currentUser.username}}
              <template v-slot:actions>
                <v-btn color="white--text red accent-4" @click="deleteUser(currentUser.username)">
                  <v-icon left dark>
                    mdi-delete
                  </v-icon>
                  Delete
                </v-btn>
              </template>
            </v-banner>


            <v-banner v-if='hasRoleAdmin || isMe' two-line>
              <form autocomplete="on">
                Change Passsword {{ currentUser.username}}
                <v-row>
                  <v-col cols="3">
                    <v-subheader>New Password</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field v-model="password" autocomplete="new-password" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]" :type="show1 ? 'text' : 'password'" name="newpassword" label="New Password" hint="At least 8 characters"
                      counter @click:append="show1 = !show1"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3">
                    <v-subheader>Old Password</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field v-model="oldPassword" autocomplete="new-password" :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]" :type="show2 ? 'text' : 'password'" name="oldpassword" label="Old Password"
                      hint="At least 8 characters" counter @click:append="show2 = !show2"></v-text-field>
                  </v-col>
                </v-row>
              </form>
              <template v-slot:actions>
                <v-btn color="white--text red accent-4" @click="changePassword(currentUser.username, password, oldPassword)">
                  <v-icon left dark>
                    mdi-delete
                  </v-icon>
                  Change
                </v-btn>
              </template>
            </v-banner>
          </v-container>
        </v-card>
      </v-tab-item>

      <!-- ROOM ZONE -->
      <v-tab-item v-if="hasRoleAdmin">
        <v-card tile>
          <v-container fluid>
            <v-list-item>
              <v-list-item-icon>
                <v-icon color="indigo">
                  mdi-home
                </v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>Rooms
                </v-list-item-title>
                <v-list-item-subtitle>Rooms Adminstration</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-banner v-if='hasRoleAdmin' two-line>
              <v-select v-model="resultRooms" :items="rooms" chips label="Select Rooms" multiple prepend-icon="mdi-shield-account" v-on:input="changeRooms" item-text="name">
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip v-bind="attrs" :input-value="selected" @click="select" @click:close="deleteRoom(item.name)">
                    <strong>{{ item.name }}</strong>&nbsp;
                  </v-chip>
                </template>
              </v-select>
              <v-progress-circular v-if="loading" :size="15" color="primary" indeterminate></v-progress-circular>
            </v-banner>
          </v-container>
        </v-card>
      </v-tab-item>

    </v-tabs-items>
  </v-card>
</v-window>
</template>

<script>
import {
  mapGetters
  //mapMutations,
  //mapActions
} from 'vuex';
//import notify from '@/plugins/nodefony/components/notify.vue';
export default {
  name: 'EditUser',
  components: {
    //"nodefony-notify": notify
  },
  props: {
    user: {
      type: Object,
      default: () => {
        return null;
      }
    },
    create: {
      type: Boolean,
      default: false
    },
    username: {
      type: String,
      default: ""
    }
  },
  data: () => ({
    loading: false,
    message: null,
    creating: false,
    editing: false,
    tab: null,
    panel: [1, 0, 0],
    show1: false,
    show2: false,
    rules: {
      required: value => !!value || 'Required.',
      min: v => v.length >= 8 || 'Min 8 characters',
    },
    roles: ["ROLE_ADMIN", "ROLE_USER"],
    states: [{
      text: "English",
      value: "en_en"
    }, {
      text: "Francais",
      value: "fr_fr"
    }],
    password: "",
    oldPassword: "",
    results: {},
    currentUser: null,
    rooms: [],
    resultRooms: []
  }),
  async mounted() {
    if (this.username) {
      this.currentUser = await this.getUserName(this.username);
    } else {
      if (this.user) {
        this.currentUser = this.user;
        this.resultRooms = this.currentUser.rooms;
      }
    }
    this.results = this.currentUser;
    this.getRooms();
  },
  beforeUpdate() {},
  updated() {},
  destroyed() {},
  watch: {
    message(value) {
      this.notify(value);
    },
    user() {
      if (this.user && !this.create) {
        this.tab = 0
        this.currentUser = this.user;
        this.results = this.currentUser;
        this.resultRooms = this.currentUser.rooms;
      }
    },
    create() {
      if (this.create) {
        this.creating = true;
        this.results = {
          username: "",
          name: "",
          surname: "",
          password: "",
          confirm: "",
          enabled: true,
          lang: "en_en",
          gender: "none",
          roles: [this.roles[1]]
        };
        this.tab = 3
      } else {
        this.tab = 0
        this.creating = false;
      }
    }
  },
  computed: {
    ...mapGetters([
      'hasRole',
      'getProfileUsername'
    ]),
    hasRoleAdmin() {
      return this.hasRole("ROLE_ADMIN");
    },
    userHasRoleAdmin() {
      if (this.currentUser && this.currentUser.roles) {
        const res = this.currentUser.roles.indexOf("ROLE_ADMIN")
        if (res >= 0) {
          return true;
        }
      }
      return false;
    },
    isMe() {
      if (this.currentUser) {
        return this.currentUser.username === this.getProfileUsername;
      }
      return false;
    }
  },
  methods: {
    async getUserName(username) {
      this.loading = true;
      return this.$nodefony.request(`users/${username}`)
        .then((response) => {
          this.loading = false;
          this.resultRooms = response.result.rooms;
          return response.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.log(e, "ERROR");
        });
    },
    removeRoleAdmin(roles) {
      if (this.userHasRoleAdmin) {
        const res = roles.indexOf("ROLE_ADMIN");
        return roles.splice(res, 1);
      }
    },
    deleteUser(username) {
      username = username || this.currentUser.username;
      return this.$nodefony.request(`users/${username}`, "DELETE")
        .then((response) => {
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`Delete ${response.result.user.username} ok`, "INFO");
          }
          this.$emit("remove", response.result.user);
          this.close();
          return response.result.user;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    },
    updateUser(form = {}) {
      if (form.password === null) {
        delete form.password;
      }
      delete form.createdAt;
      delete form.updatedAt;
      return this.$nodefony.request(`users/${form.username}`, "PUT", {
          body: JSON.stringify(form),
          headers: {
            "content-type": "application/json"
          }
        })
        .then((response) => {
          this.currentUser = response.result.user;
          //this.resultRooms = response.result.user.rooms;
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`update ok`, "INFO");
          }
          this.tab = 0;
          return response.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        })
    },
    async createUser() {
      return this.$nodefony.request(`users`, "POST", {
          body: JSON.stringify(this.results),
          headers: {
            "content-type": "application/json"
          }
        })
        .then((response) => {
          this.creating = false;
          this.currentUser = response.result.user;
          //this.resultRooms = response.result.user.rooms;
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`create ${this.currentUser.username}`, "INFO");
          }
          this.$router.replace({
            name: 'User',
            params: {
              username: this.currentUser.username
            },
            force: true
          });

          this.tab = 0;
          return response.result;
        })
        .catch(async (result) => {
          this.loading = false;
          if (result.error) {
            if (result.error.errors) {
              this.showErrorField(result.error.errors);
            } else {
              this.message = this.log(result.error.message, "ERROR");
            }
          } else {
            this.message = this.log(result.message, "ERROR");
          }
        })
    },
    showErrorField(errors) {
      errors.forEach((error) => {
        this.message = this.log(error.message, "ERROR")
      });
    },
    close() {
      return this.$emit("close", this.user)
    },
    async save() {
      this.loading = true;
      await this.updateUser(this.results);
      this.editing = false;
    },
    async addUser() {
      this.loading = true;
      await this.createUser()
    },
    async changeRole(username, roles) {
      this.loading = true;
      if (this.userHasRoleAdmin) {
        let res = this.removeRoleAdmin(roles);
        if (res) {
          return await this.updateUser({
            username,
            roles
          });
        }
      }
    },
    async changePassword(username, password, old) {
      this.loading = true;
      return await this.updateUser({
        username,
        password,
        "old-password": old
      });
    },
    async enableUser(username) {
      this.loading = true;
      return await this.updateUser({
        username: username,
        enabled: true
      });
    },
    async changeRooms(tab) {
      let currentsRooms = this.currentUser.rooms
        .map((room) => {
          return room.name
        });
      let roomToAdd = tab
        .filter((room) => {
          let index = currentsRooms.indexOf(room);
          if (index >= 0) {
            currentsRooms.splice(index, 1);
            return false;
          } else {
            return room;
          }
        });
      for (let room of roomToAdd) {
        await this.addRoom(room);
      }
      for (let room of currentsRooms) {
        await this.deleteRoom(room);
      }
      //console.log("room to add ", roomToAdd)
      //console.log("room to delete", currentsRooms);
    },
    getRooms() {
      this.loading = true;
      return this.$mediasoup.request("rooms")
        .then((response) => {
          this.rooms = response.result.rows;
          this.loading = false;
        })
        .catch(e => {
          this.log(e, "ERROR");
          this.loading = false;
          throw e
        })
    },
    addRoom(roomid) {
      let path = `users/${this.currentUser.username}/room`;
      return this.$nodefony.request(path, "PUT", {
          body: JSON.stringify({
            roomid: roomid
          }),
          headers: {
            "content-type": "application/json"
          }
        })
        .then((response) => {
          this.currentUser.rooms = response.result.rooms;
          this.resultRooms = response.result.rooms;
          this.message = this.log(`Attach room ${roomid} ok`, "INFO");
          return response.result
        })
        .catch((e) => {
          this.message = this.log(e.message, "ERROR");
        })
    },
    deleteRoom(roomid) {
      let path = `users/${this.currentUser.username}/room`;
      return this.$nodefony.request(path, "DELETE", {
          body: JSON.stringify({
            roomid: roomid
          }),
          headers: {
            "content-type": "application/json"
          }
        })
        .then((response) => {
          this.currentUser.rooms = response.result.rooms;
          this.resultRooms = response.result.rooms;
          this.message = this.log(`Delete room ${roomid} ok`, "INFO");
          return response.result
        })
        .catch((e) => {
          this.message = this.log(e.message, "ERROR");
        })
    }
  }
}
</script>

<style scoped>
.scroll {
  overflow-y: scroll
}
</style>
