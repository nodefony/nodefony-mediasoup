<template>
<v-window>
  <v-card>
    <v-toolbar color="blue-grey" dark flat>
      <v-icon class="mr-5">mdi-home</v-icon>
      <v-toolbar-title> {{ $t('rooms.room') }} {{room? room.name : ""}}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-icon @click="close">mdi-close</v-icon>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab> {{$t(`rooms.info`)}}</v-tab>
          <v-tab> {{$t(`rooms.room`)}} </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-expansion-panels v-model="panel" multiple focusable>
            <v-expansion-panel :readonly="true" class="mx-5 my-3">
              <v-expansion-panel-header>{{$t('rooms.info')}}</v-expansion-panel-header>
              <v-expansion-panel-content>

                <v-list three-line>
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
                        <v-list-item-title class="green--text" v-if="room.secure">
                          <v-icon left color="green"> mdi-lock </v-icon>{{$t("rooms.secure")}}
                        </v-list-item-title>
                        <v-list-item-title class="red--text" v-else>
                          <v-icon left color="red"> mdi-lock-off </v-icon>{{$t("rooms.unsecure")}}
                        </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-tab-item>


      <v-tab-item>
        <v-card flat>
          <v-container fluid>
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
    creating: false,
    panel: [1, 0, 0],
    formData: {},
    items: [
      'room', 'info',
    ]
  }),
  async mounted() {
    if (this.room) {
      console.log("mounted", this.room)
    }
    this.formData = { ...this.room };
  },
  destroyed() {
    //console.log("destroyed", this.room.name)
  },
  watch: {

  },
  computed: {

  },
  methods: {
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
          this.room = data.result.room;
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
          this.room = response.result.room;
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
