<template>
<v-window>
  <v-card v-if="currentUser || creating" outlined class="mb-10 scroll" style="background:transparent">

    <v-toolbar extended prominent color="blue-grey" dark>
      <v-icon x-large class="mr-5">mdi-account</v-icon>

      <v-toolbar-title v-if="currentUser"> {{ currentUser.username || ""}}
        <v-spacer></v-spacer>
        <!--v-card-subtitle> {{ user.name }} {{ user.surname }}</v-card-subtitle-->
        <!--nodefony-notify v-if="message" :pdu="message" type="alert" /-->
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn v-if="user" icon>
        <v-icon @click="close">mdi-close</v-icon>
      </v-btn>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab :disabled="creating" ref="user">
            {{ $t(`users.user`) }}
          </v-tab>
          <v-tab :disabled=" (!hasRoleAdmin && !isMe)" ref="info">
            {{ $t(`users.info`) }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-progress-linear indeterminate v-if="loading" value="18"></v-progress-linear>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat>
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

          <v-expansion-panels v-model="panel" multiple focusable>
            <v-expansion-panel :readonly="true" class="mx-5 my-3">
              <v-expansion-panel-header>{{$t('users.info')}}</v-expansion-panel-header>
              <v-expansion-panel-content v-if="currentUser">

                <v-list two-line>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{currentUser.name}}</v-list-item-title>
                      <v-list-item-subtitle>{{$t("users.name")}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>{{currentUser.surname}}</v-list-item-title>
                      <v-list-item-subtitle>{{$t("users.surname")}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-divider></v-divider>

                  <v-list-item>
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

                  <!--v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo">
                        mdi-phone
                      </v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{$t('no-specified')}}</v-list-item-title>
                      <v-list-item-subtitle>Mobile</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-icon>
                      <v-icon>mdi-message-text</v-icon>
                    </v-list-item-icon>
                  </v-list-item>

                  <v-divider inset></v-divider>

                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon color="indigo">
                        mdi-map-marker
                      </v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                      <v-list-item-title>{{$t('no-specified')}}</v-list-item-title>
                      <v-list-item-subtitle></v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item-->
                </v-list>

              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-container v-if='currentUser && (hasRoleAdmin || isMe)' fluid>
              <v-expansion-panel class="mx-5 my-3">
                <v-expansion-panel-header class="red--text">Danger Zone</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-card-title class="red--text">Danger Zone</v-card-title>
                  <v-banner v-if='(hasRoleAdmin && userHasRoleAdmin) || (isMe && userHasRoleAdmin)' single-line>
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

                  <v-banner v-if='hasRoleAdmin' two-line>
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
                    Change Passsword {{ currentUser.username}}
                    <v-row>
                      <v-col cols="3">
                        <v-subheader>New Password</v-subheader>
                      </v-col>
                      <v-col cols="9">
                        <v-text-field v-model="password" autocomplete="new-password" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'" :rules="[rules.required, rules.min]" :type="show1 ? 'text' : 'password'" name="newpassword" label="New Password"
                          hint="At least 8 characters" counter @click:append="show1 = !show1"></v-text-field>
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
                    <template v-slot:actions>
                      <v-btn color="white--text red accent-4" @click="changePassword(currentUser.username, password, oldPassword)">
                        <v-icon left dark>
                          mdi-delete
                        </v-icon>
                        Change
                      </v-btn>
                    </template>
                  </v-banner>

                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-container>

          </v-expansion-panels>
        </v-card>
      </v-tab-item>

      <!-- form -->
      <v-tab-item>
        <v-card flat>
          <v-container fluid>
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

              <v-row>
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
              </v-row>

              <v-divider class="my-3"></v-divider>

              <v-row>
                <v-col cols="3">
                  <v-subheader>Enable User </v-subheader>
                </v-col>
                <v-col cols="9">
                  <v-switch v-model="results.enabled" :label="`Enable`"></v-switch>
                </v-col>
              </v-row>

              <v-divider class="my-2"></v-divider>

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
import notify from '@/plugins/nodefony/components/notify.vue';
export default {
  name: 'EditUser',
  components: {
    "nodefony-notify": notify
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
    tab: null,
    panel: [1, 0, 0],
    show1: false,
    show2: true,
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
    currentUser: null
  }),
  async mounted() {
    if (this.username) {
      this.currentUser = await this.getUserName(this.username);
    } else {
      if (this.user) {
        this.currentUser = this.user;
      }
    }
    this.results = this.currentUser;
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
        this.tab = 1
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
        .then((data) => {
          this.loading = false;
          if (data.message) {
            this.message = this.log(data.message, "INFO");
          } else {
            this.message = this.log(`Delete ${data.result.user.username} ok`, "INFO");
          }
          this.$emit("remove", data.result.user);
          this.close();
          return data.result.user;
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
        .then((data) => {
          this.currentUser = data.result.user;
          this.loading = false;
          if (data.message) {
            this.message = this.log(data.message, "INFO");
          } else {
            this.message = this.log(`update ok`, "INFO");
          }
          return data.result;
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
      await this.updateUser(this.results)
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
    }
  }
}
</script>

<style scoped>
.scroll {
  overflow-y: scroll
}
</style>
