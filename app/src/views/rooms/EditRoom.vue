<template>
<v-window>
  <v-card>
    <v-toolbar color="blue-grey" dark flat>
      <v-icon class="mr-5">mdi-home</v-icon>
      <v-toolbar-title>
        {{room ? room.name : ""}}
        <v-btn v-if="hasRoleAdmin && !creating" class="ml-10" small @click="editing=!editing;tab =0" color="teal">
          <v-icon small left>mdi-pencil</v-icon>
          Edit
        </v-btn>

      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title v-on:change="editing=false">
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab :disabled="false" ref="info" @click="editing=false">
            {{ $t(`rooms.info`) }}
          </v-tab>
          <v-tab v-if="!creating && hasRoleAdmin " :disabled="false" ref="danger" @click="editing=false">
            Zone Danger
          </v-tab>
          <v-tab v-if="!creating && hasRoleAdmin" :disabled="false" ref="administrators" @click="editing=false">
            Administrators
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat tile>
          <v-container fluid v-if="!editing && !creating">
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{room.name}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("name")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{room.description}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("rooms.description")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>{{formatAccessLabel(room.access)}}</v-list-item-title>
                  <v-list-item-subtitle>{{$t("rooms.access")}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-row>
                    <v-col cols="3">
                      <v-list-item-title>{{$t("rooms.waiting")}}</v-list-item-title>
                      <v-list-item-subtitle>{{$t("rooms.hall")}}</v-list-item-subtitle>
                    </v-col>
                    <v-col cols="9">
                      <v-switch :disabled="true" v-model="room.waitingconnect"></v-switch>
                    </v-col>
                  </v-row>
                </v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="green--text" v-if="room.secure">
                    <v-icon left color="green"> mdi-lock </v-icon>{{$t("rooms.secure")}}
                  </v-list-item-title>
                  <v-list-item-title class="red--text" v-else>
                    <v-icon left color="red"> mdi-lock-off </v-icon>{{$t("rooms.unsecure")}}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="room">
                <v-list-item-icon>
                  <v-icon color="indigo">
                    mdi-shield-account
                  </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>
                    <v-chip class="mx-2 my-1" x-small v-for="user in administrators" :key="`${user.username}-chip`">
                      {{ user.username }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>Administrators</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

            </v-list>
          </v-container>

          <!-- EDIT -->
          <v-container fluid v-if="editing || creating" class="mt-3">
            <v-card flat tile>
              <form autocomplete="on">
                <v-row>
                  <v-col cols="3">
                    <v-subheader>{{$t('name')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field dense label="Name" v-model="formData.name"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3">
                    <v-subheader>{{$t('rooms.description')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field dense label="Description" v-model="formData.description"></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="3">
                    <v-subheader>{{$t('rooms.access')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-switch v-model="formData.access" :false-value="`private`" :true-value="`public`" :label="formatAccessLabel(formData.access)"></v-switch>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="3">
                    <v-subheader>{{$t('rooms.waiting')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-switch v-model="formData.waitingconnect"></v-switch>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="3">
                    <v-subheader>{{$t('rooms.security')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-switch v-model="formData.secure" :label="formData.secure ? $t('rooms.secure') : $t('rooms.unsecure')" :prepend-icon="formData.secure ? 'mdi-lock' : 'mdi-lock-off'" color="green"></v-switch>
                  </v-col>
                </v-row>

                <v-row v-if="formData.secure">
                  <v-col cols="3">
                    <v-subheader>Password</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-text-field v-model="formData.password" autocomplete="password" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.min]" :type="showPassword ? 'text' : 'password'" name="password" label="Change Password"
                      hint="At least 8 characters. Leave empty for unchanged." counter @click:append="showPassword = !showPassword"></v-text-field>
                  </v-col>
                </v-row>
              </form>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="creating" depressed @click="addRoom">
                  Create
                </v-btn>
                <v-btn v-else depressed @click="saveRoom">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-container>
        </v-card>
      </v-tab-item>

      <!-- DANGER ZONE -->
      <v-tab-item>

        <v-banner v-if='hasRoleAdmin' two-line tile>
          Delete the Room {{ room.name}}
          <template v-slot:actions>
            <v-btn color="white--text red accent-4" @click="deleteRoom(room.name)">
              <v-icon left dark>
                mdi-delete
              </v-icon>
              Delete
            </v-btn>
          </template>
        </v-banner>

      </v-tab-item>

      <!-- ADMIN ZONE -->
      <v-tab-item>
        <v-data-table :headers="headersUser" :items="administrators" height="600px" class="elevation-1">

          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Aministrators</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-dialog v-model="dialog" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn small color="primary" dark class="mb-2" v-bind="attrs" v-on="on" @click="openDialog">
                    Add
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ $t('users.users') }}</span>
                  </v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item v-for="user in users" :key="user.username">

                        <v-list-item-avatar>
                          <v-icon dark>mdi-account</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content>
                          <v-list-item-title v-text="user.username"></v-list-item-title>

                          <v-list-item-subtitle v-text="user.name">{{user.name}} {{user.surname}}</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                          <v-switch :loading="loading" :input-value="userIsAdmin(user.username)" v-on:change="changeAdminRoom(user.username , $event)">
                          </v-switch>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="dialog=false">
                      Quit
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:default>

          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small @click="dialog=true">
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</v-window>
</template>


<script>
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';


export default {
  name: 'EditRoom',
  props: {
    roomid: {
      type: String,
      default: null
    }
  },
  data: () => ({
    dialog: false,
    tab: null,
    editing: false,
    message: null,
    room: {},
    users: null,
    administrators: null,
    showPassword: false,
    rules: {
      min: v => !v || v.length >= 8 || 'Min 8 characters',
    },
    panel: [1, 0, 0],
    formData: {
      password: ""
    }
  }),
  async mounted() {
    if (this.roomid) {
      this.room = await this.getRoom(this.roomid);
      if (this.room) {
        this.room.access = this.room.access || "private";
        this.room.secure = (typeof this.room.secure === "undefined" ? false : this.room.secure);
        this.room.waitingconnect = (typeof this.room.waitingconnect === "undefined" ? false : this.room.waitingconnect);
        this.formData = { ...this.room,
          ...this.formData
        };
        delete this.formData.users;
        //this.administrators = this.room.users;
      }
    }
  },
  destroyed() {
    //console.log("destroyed", this.room.name)
  },
  watch: {
    message(value) {
      this.notify(value);
    },
    room(value) {
      this.administrators = value.users;
      return value;
    }
  },
  computed: {
    ...mapGetters([
      'hasRole'
    ]),
    creating() {
      return !this.roomid;
    },
    hasRoleAdmin() {
      return this.hasRole("ROLE_ADMIN");
    },
    headersUser() {
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
        text: "",
        value: 'actions',
        sortable: false
      }]
    },
    userIsAdmin() {
      return (username) => {
        let tab = this.administrators.filter((admin) => {
          if (admin.username === username) {
            return admin
          }
        });
        if (tab.length) {
          return username;
        }
        return null;
      }
    },
  },
  methods: {
    async getRoom(roomid) {
      this.loading = true;
      return this.$mediasoup.request(`room/${roomid}`)
        .then((response) => {
          this.loading = false;
          return response.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.log(e, "ERROR");
          return null;
        });
    },
    formatAccessLabel(label) {
      return label == 'private' ? 'Private' : 'Public';
    },
    saveRoom() {
      const form = this.formData;
      this.loading = true;
      delete form.createdAt;
      delete form.updatedAt;
      return this.$mediasoup.request(`room/${this.room.name}`, "PUT", {
          body: JSON.stringify(form),
          headers: {
            "content-type": "application/json"
          }
        })
        .then((data) => {
          Object.assign(this.room, data.result.room);
          this.loading = false;
          if (data.message) {
            this.message = this.log(data.message, "INFO");
          } else {
            this.message = this.log(`update ok`, "INFO");
          }
          this.editing = false;
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        })
    },
    deleteRoom(name) {
      this.loading = true;
      name = name || this.room.name;
      return this.$mediasoup.request(`room/${name}`, "DELETE")
        .then((response) => {
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`Delete ${name} ok`, "INFO");
          }
          this.$emit("remove", this.room);
          this.close();
          this.$router.replace({
            name: 'Rooms',
            params: {},
            force: true
          });
          return response.result.room;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    },
    async addRoom() {
      this.loading = true;
      return this.$mediasoup.request(`rooms`, "POST", {
          body: JSON.stringify(this.formData),
          headers: {
            "content-type": "application/json"
          }
        })
        .then((response) => {
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`create ${response.result.room.name}`, "INFO");
          }
          this.$router.replace({
              name: 'Room',
              params: {
                roomid: response.result.room.name
              },
              force: true
            })
            .then(() => {
              this.tab = 0;
            })
          return response.result;
        })
        .catch(async (result) => {
          this.loading = false;
          if (result.error) {
            if (result.error.errors) {
              this.message = this.log(result.error.errors[0].message, "ERROR");
            } else {
              this.message = this.log(result.error.message, "ERROR");
            }
          } else {
            this.message = this.log(result.message, "ERROR");
          }
        })
    },
    getUsers() {
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
    changeAdminRoom(username, active) {
      this.loading = true;
      if (active) {

        return this.$mediasoup.request(`room/${this.room.name}/user`, "PUT", {
            body: JSON.stringify({
              username: username
            }),
            headers: {
              "content-type": "application/json"
            }
          }).then((response) => {
            this.loading = false;
            this.room = response.result.room;
            return this.room;
          })
          .catch((e) => {
            this.loading = false;
            this.message = this.log(e, 'ERROR');
            throw e;
          })
      } else {
        return this.$mediasoup.request(`room/${this.room.name}/user`, "DELETE", {
            body: JSON.stringify({
              username: username
            }),
            headers: {
              "content-type": "application/json"
            }
          }).then((response) => {
            this.loading = false;
            this.room = response.result.room;
            return this.room;
          })
          .catch((e) => {
            this.loading = false;
            this.message = this.log(e, 'ERROR');
            throw e;
          })
      }
    },
    close() {
      return this.$emit("close", this.room)
    },
    openDialog() {
      this.dialog = true;
      return this.getUsers();
    }
  }
}
</script>
