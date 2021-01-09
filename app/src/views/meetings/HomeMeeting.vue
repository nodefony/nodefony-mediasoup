<template>
<v-window class="nodefony--background">

  <v-container v-if="room" fluid>
    <v-row justify="center" align="center" class="mt-10">
      <div class="text-h1 teal--text text--lighten-3"> Meetings {{room.name}}</div>
    </v-row>
    <v-row justify="center" align="center" class="mt-10">
      <div class="text-h4 teal--text text--lighten-1"> {{room.description}}</div>
    </v-row>

    <v-row v-if="room.secure" justify="center" align="center" class="mt-15">
      <v-col cols="12" sm="6">
        <v-text-field :rules="[rules.required, rules.min]" class="teal--text text--lighten-3" :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" :type="show ? 'text' : 'password'" dense dark v-model="password" label="Enter Room password" outlined
          clearable :hint="`The room ${room.name} has restricted access`" @click:append="show = !show"></v-text-field>
      </v-col>
    </v-row>

    <v-row justify="center" align="center" :class="room.secure ? 'mt-5' :'mt-15'">
      <v-btn small :loading="loading" :disabled="loading" color="blue-grey" class="ma-2 white--text" @click="join">
        Connect
        <v-icon right dark>
          mdi-home
        </v-icon>
      </v-btn>
    </v-row>
  </v-container>

</v-window>
</template>

<script>
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';


export default {
  name: 'HomeMeeting',
  props: {
    roomid: {
      type: String
    }
  },
  data: () => ({
    message: null,
    room: null,
    password: "",
    show: false,
    rules: {
      required: value => !!value || 'Required.',
      min: v => v.length >= 8 || 'Min 8 characters'
    }
  }),
  async mounted() {
    this.room = await this.getRoom(this.roomid)
      .then((room) => {
        this.loading = false;
        if (room.access === "public") {
          //
        } else {
          if (!this.isAuthenticated) {
            this.$router.push({
              name: 'Login'
            }).catch(() => {})
          }
        }
        return room;
      })
      .catch(e => {
        this.loading = false;
        if (e.response) {
          this.message = this.log(e.response.message, "ERROR")
        }
      });
  },
  destroyed() {
    //console.log("destroyed", this.room.name)
  },
  watch: {
    message(message) {
      this.notify(message);
    }
  },
  computed: {
    ...mapGetters([
      "isAuthenticated",
      'getProfileUsername'
    ]),
  },
  methods: {
    async getRoom(id) {
      try {
        this.log("Get rooms", "DEBUG");
        let res = await this.$mediasoup.api.http(`room/${id}`)
          .catch(e => {
            throw e;
          });
        let room = res.result;
        this.log(room, "DEBUG");
        return room;
      } catch (e) {
        this.log(e, "ERROR");
        throw e;
      }
    },
    join() {
      const body = {
        password: this.password,
        username: this.getProfileUsername,
        room: this.room.name
      }
      this.loading = true;
      return this.$mediasoup.api.post(`access/room/${this.room.name}`, {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          this.loading = false;
          this.$emit("connect", response);
          return response;
        })
        .catch(e => {
          this.loading = false;
          if (e.response) {
            // log error
            this.message = this.log(e.response.message, "ERROR")
          } else {
            this.message = this.log(e.message, "ERROR")
          }

        })
    }

  }
}
</script>

<style scoped lang="scss">
.nodefony--background {
    position: relative;
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url("../../assets/chateau-if.jpg");
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
