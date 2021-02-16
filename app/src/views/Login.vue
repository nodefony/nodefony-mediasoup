<template>
<v-container class="nodefony--background" fluid>
  <v-row class="mt-10" justify="center" style="width:100%;height:100%">
    <v-card dark width="60%" height="400px" max-height="80%">
      <v-row class="ma-5">
        <v-col>
          <v-row justify="center" align="center" class="mb-3">
            <img src="../assets/mediasoup.png" />
          </v-row>
          <v-row justify="center" align="center">
            <v-card-title>Mediasoup </v-card-title>
          </v-row>
        </v-col>
      </v-row>

      <v-card-subtitle class="pb-0">
        <v-text-field v-if="isLoading" color="success" loading disabled>
        </v-text-field>
        <nodefony-notify outlined app top v-if="message" :pdu="message" />
      </v-card-subtitle>
      <v-card-text class="text--primary">

        <v-form @submit.prevent="submit" ref="form">
          <v-select v-if="false" v-model="select" :items="items" label="Authencation type" required></v-select>

          <v-text-field v-model="username" placeholder="username" :counter="50" :rules="nameRules" :label="$t('username')" required prepend-icon="mdi-account-circle" />

          <v-text-field :label="$t('password')" v-model="password" placeholder="password" prepend-icon="mdi-lock" :type="showPassword ? 'text' : 'password'" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword"
            required />

          <v-btn type="submit" class="mx-6 my-4" color="success">
            {{ $t('submit') }}
          </v-btn>

        </v-form>
      </v-card-text>
    </v-card>
    <!--/v-col-->
  </v-row>
  <!--/v-col-->
</v-container>
</template>

<script>
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';

import notify from '@/plugins/nodefony/notify/snackbar.vue';

export default {
  name: 'Login',
  data: () => ({
    showPassword: false,
    valid: true,
    username: '',
    password: '',
    nameRules: [
      v => !!v || 'Name is required',
      v => (v && v.length <= 50) || 'Name must be less than 50 characters'
    ],
    select: 'JWT',
    items: [
      'JWT',
      'LDAP',
      'OAUTH',
      'GITHUB'
    ],
    message: null,
    validMessage: null,
    logColor: 'teal',
    viewerActive: false,
    iframe: null
  }),
  components: {
    "nodefony-notify": notify
  },
  computed: {
    ...mapGetters([
      'isLoading'
    ])
  },
  mounted() {
    this.clear();
    this.openNavBar();
    if (this.$route.name === "Logout") {
      this.logout()
    }
    this.closeDrawer();
  },
  beforeUpdate() {

  },
  beforeDestroy() {

  },
  watch: {
    message(value) {
      if (value) {
        this.notify(value)
      }
    }
  },
  methods: {
    ...mapMutations([
      'clear',
      'closeDrawer',
      'openNavBar'
    ]),
    ...mapActions({
      auth: 'AUTH_REQUEST',
      logout: 'AUTH_LOGOUT'
    }),
    reset() {
      this.$refs.form.reset();
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
    validate() {
      return this.$refs.form.validate();
    },
    parseMessage(pdu) {
      pdu.msgid = "LOGIN";
      if (!pdu.payload) {
        pdu.payload = 'No Message';
        return pdu;
      }
      if (pdu.payload.response) {
        pdu.payload = pdu.payload.response.data.message;
      } else {
        if (pdu.payload.message) {
          pdu.payload = pdu.payload.message;
        } else {
          if (!pdu.payload) {
            pdu.type = 'error';
            pdu.payload = 'INTERNAL ERROR';
          }
        }
      }
      return pdu;
    },
    async submit() {
      const form = this.$refs.form;
      if (form.validate()) {
        this.message = null;
        try {
          const {
            username,
            password
          } = this;
          return this.auth({
              url: '/api/jwt/login',
              username,
              password
            })
            .then((res) => {
              this.$router.push('/')
              window.location = 'home';
              return res;
            })
            .catch(e => {
              this.message = this.parseMessage(this.log(e, 'ERROR'));
            });
        } catch (e) {
          this.message = this.parseMessage(this.log(e, 'ERROR'));
        } finally {
          form.resetValidation();
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
/*.nodefony--background {
    display: flex;
    align-items: center;
    justify-content: center;
}*/
</style>

<i18n>
  {
    "en" : {
      "signin" : "Authentication",
      "submit" : "Submit",
      "username" : "User Name",
      "password" : "Password"
    },
    "fr" : {
      "signin" : "Authentification",
      "submit" : "Se Connecter",
      "username" : "Utilisateur",
      "password" : "Mot de Passe"
    }
  }
</i18n>
