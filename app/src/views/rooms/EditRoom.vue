<template>
<v-window>
  <v-card>
    <v-toolbar color="blue-grey" dark flat>
      <v-icon class="mr-5">mdi-home</v-icon>
      <v-toolbar-title>
        {{ $t('rooms.room') }} {{room ? room.name : ""}}
        <v-btn class="ml-10" small @click="editing=!editing;tab =0" color="teal">
          <v-icon small left>mdi-pencil</v-icon>
          Edit
        </v-btn>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title v-on:change="editing=false">
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab :disabled="false" ref="user" @click="editing=false">
            {{ $t(`users.info`) }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card flat tile>
          <v-container v-if="!editing">
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
                    <v-list-item-title class="green--text" v-if="room.secure">
                      <v-icon left color="green"> mdi-lock </v-icon>{{$t("rooms.secure")}}
                    </v-list-item-title>
                    <v-list-item-title class="red--text" v-else>
                      <v-icon left color="red"> mdi-lock-off </v-icon>{{$t("rooms.unsecure")}}
                    </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-container>
          <v-container fluid v-if="editing">
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
    room: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    tab: null,
    editing: false,
    creating: false,
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
    if (this.room) {
      console.log("mounted", this.room)
    }
    this.formData = { ...this.room, ...this.formData };
  },
  destroyed() {
    //console.log("destroyed", this.room.name)
  },
  watch: {

  },
  computed: {

  },
  methods: {
    formatAccessLabel(label) {
      return label == 'private' ? 'Private' : 'Public';
    },
    async deleteRoom() {
      console.log("remove")
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
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        })
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
          this.creating = false;
          Object.assign(this.room, data.result.room);
          this.loading = false;
          if (response.message) {
            this.message = this.log(response.message, "INFO");
          } else {
            this.message = this.log(`create ${this.room.name}`, "INFO");
          }
          this.$router.replace({
            name: 'Rooms',
            params: {
              roomid: this.room.name
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
    close() {
      return this.$emit("close", this.room)
    }
  }
}
</script>
