<template>
<v-window class="nodefony--background">

  <v-container>

    <v-row v-if="room" justify="center" align="center" class="mt-10">
      <div class="text-h2 teal--text text--lighten-3"> Meetings {{room.name}}</div>
    </v-row>

    <v-row v-if="room" justify="center" align="center" class="mt-10">
      <div class="text-h5 teal--text text--lighten-1"> {{room.description}}</div>
    </v-row>

    <v-row justify="center" align="center" class="mt-15" style="height:50px">
      <div v-show="progress" class="text-h4 blue-grey--text text--lighten-1"> {{progress}}</div>
    </v-row>

    <v-row justify="center" align="center" class="mt-10">
      <div style="min-height: 4px ;max-width:500px;width:100%">
        <v-progress-linear :active="waiting" :indeterminate="true" :query="true"></v-progress-linear>
      </div>
    </v-row>
  </v-container>

  <v-container v-if="room && !waiting">

    <v-row v-if="room" justify="center" align="center" class="mt-15">
      <v-text-field style="min-width:200px ;max-width:350px" :disabled="usernamedisabled" :rules="[rules.required]" class="teal--text text--lighten-3" type="text" dense dark v-model="username" :label="$t('users.user')" outlined :hint="`${username} access`"></v-text-field>
    </v-row>

    <v-row v-if="room.secure" justify="center" align="center" class="mt-5">
      <v-text-field style="min-width:200px ;max-width:350px" :rules="[rules.required, rules.min]" class="teal--text text--lighten-3" :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" :type="show ? 'text' : 'password'" dense dark v-model="password"
        label="Enter Room password" outlined clearable :hint="`The room ${room.name} has restricted access`" @click:append="show = !show"></v-text-field>
    </v-row>

    <v-row justify="center" align="center" :class="room.secure ? 'mt-5' :'mt-15'">
      <v-btn small :loading="loading" :disabled="loading" color="blue-grey" class="ma-2 white--text" @click="connect">
        Connect
        <v-icon right dark>
          mdi-home
        </v-icon>
      </v-btn>
    </v-row>
  </v-container>

  <v-container v-if="waiting" class="mt-5">

    <v-row justify="center" align="center" class="mt-10">
      <v-btn small :loading="loading" :disabled="loading" color="blue-grey" class="ma-2 white--text" @click="quit">
        Quit
        <v-icon right dark>
          mdi-home
        </v-icon>
      </v-btn>
    </v-row>
  </v-container>

  <v-container fluid width="100%">
    <v-row class=" mt-10" justify="space-around">
      <v-col v-if="administrators" cols="auto" class="ml-5">
        <v-simple-table dense fixed-header dark height="200px">
          <template v-slot:top>
            <v-icon class="mx-5 my-3">mdi-security</v-icon> Room Managers
          </template>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Room Managers
                </th>
                <th class="text-left">
                  Name
                </th>
                <th class="text-left">
                  Surname
                </th>
                <th class="text-left">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="administrator in administrators" :key="administrator.username">
                <td>{{ administrator.username }}</td>
                <td>{{ administrator.name }}</td>
                <td>{{ administrator.surname }}</td>
                <td>{{ administrator.email }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col v-if="peers" cols="auto">
        <v-simple-table dense fixed-header dark height="200px">
          <template v-slot:top>
            <v-icon class="mx-5 my-3">mdi-account</v-icon> Room Participants
          </template>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Participants
                </th>
                <th class="text-left">
                  Status
                </th>
                <th class="text-left">
                  display name
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="peer in peers" :key="peer.username">
                <td>{{ peer.id }}</td>
                <td>{{ peer.status }}</td>
                <td>{{ peer.displayName }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

      </v-col>
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
    waiting: false,
    message: null,
    progress: null,
    room: null,
    socket: null,
    administrators: null,
    peers: null,
    password: "",
    username: "",
    usernamedisabled: true,
    show: false,
    rules: {
      required: value => !!value || 'Required.',
      min: (v) => {
        if (v) {
          return v.length >= 8 || 'Min 8 characters'
        }
        return false
      }
    }
  }),
  async mounted() {
    this.loading = true;
    this.room = await this.getRoom(this.roomid)
      .then((room) => {
        this.loading = false;
        if (room.access === "public") {
          //
          if (this.isAuthenticated) {
            this.username = this.getProfileUsername;
          } else {
            this.usernamedisabled = false;
          }
        } else {
          if (!this.isAuthenticated) {
            this.$router.push({
              name: 'Login'
            }).catch(() => {})
          } else {
            this.username = this.getProfileUsername;
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
    this.log(`destroy home room component `, "DEBUG");
  },
  watch: {
    message(message) {
      this.notify(message);
    },
    getProfileUsername(value) {
      this.username = value;
    }
  },
  computed: {
    ...mapGetters([
      "isAuthenticated",
      'getProfileUsername'
    ]),
  },
  methods: {
    ...mapMutations([]),
    async getRoom(id) {
      try {
        //this.log("Get room", "DEBUG");
        let res = await this.$mediasoup.api.http(`room/${id}`)
          .catch(e => {
            throw e;
          });
        let room = res.result;
        //this.log(room, "DEBUG");
        return room;
      } catch (e) {
        this.log(e, "ERROR");
        throw e;
      }
    },
    connect() {
      const body = {
        password: this.password,
        username: this.getProfileUsername,
        room: this.room.name
      }
      this.loading = true;
      this.progress = this.log(`Try Connection`).payload;
      return this.$mediasoup.api.post(`access/room/${this.room.name}`, {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          this.password = "";
          this.loading = false;
          if (response.result.access === "authorized") {
            return this.connectMediasoup();
          }
          throw new Error(`unauthorised`);
        })
        .catch(e => {
          this.loading = false;
          this.progress = null;
          if (e.response) {
            // log error
            this.message = this.log(e.response.message, "ERROR")
          } else {
            this.message = this.log(e.message, "ERROR")
          }

        })
    },
    connectMediasoup() {
      return this.$mediasoup.leaveRoom()
        .then(() => {
          return this.$mediasoup.connect(this.roomid, this.username)
            .then((sock) => {
              this.socket = sock;
              this.$mediasoup.on("waiting", (message) => {
                let pdu = this.log(message.message, "DEBUG");
                this.progress = message.message;
                this.message = pdu;
                if (message.room && message.room.users) {
                  this.administrators = message.room.users;
                }
                if (message.peers) {
                  this.peers = message.peers;
                }
                switch (message.status) {
                  case 'wait':
                    break;
                  case 'authorised':
                    this.progress = message.message;
                    this.waiting = false;
                    this.$emit("connect", message.status);
                    break;
                  case 'unauthorised':
                    this.progress = message.message;
                    this.quit();
                    break;
                }
              });
              this.$mediasoup.once("closeSock", (event) => {
                if (event.reason) {
                  let pdu = this.log(event.reason);
                  this.progress = event.reason;
                  this.message = pdu;
                }
                this.waiting = false;
              });
              this.waiting = true;
              return sock;
            })
            .catch((e) => {
              this.log(e, "ERROR");
              this.waiting = false;
              let pdu = this.log(`Room ${this.room.name} can't be connect !!!!`);
              this.message = pdu;
              this.progress = pdu.payload;
            });
        });
    },
    quit() {
      this.log("Quit Home meeting", "DEBUG");
      this.progress = null;
      try {
        if (this.socket) {
          this.socket.close();
        }
      } catch (e) {
        this.log(e, "ERROR");
      }
      this.waiting = false;
    }
  }
}
</script>

<style scoped lang="scss">
.v-text-field {
    width: 600px;
}

.nodefony--background {
    position: relative;
    height: 100vh;
    width: 100%;
    /*display: flex;
    align-items: center;
    justify-content: center;*/
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
