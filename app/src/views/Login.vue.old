<template>
<v-container fluid>
  <v-dialog v-model="dialog" persistent max-width="600">
    <v-row align="center" justify="center" class="">
      <v-card width="600" class=" pa-5">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-img src="/app/images/app-logo.png" aspect-ratio="1"></v-img>
          </v-col>
        </v-row>
        <v-card-title>Nodefony {{ $t('signin') }} {{select}} </v-card-title>
        <v-card-subtitle class="pb-0">
          <v-text-field v-if="isLoading" color="success" loading disabled>
          </v-text-field>
          <notify v-if="message" :pdu="message" type="alert" />
        </v-card-subtitle>
        <v-card-text class="text--primary">

          <v-form @submit.prevent="submit" ref="form">
            <v-select v-model="select" :items="items" label="Authencation type" required></v-select>
            <v-text-field v-model="username" placeholder="username" :counter="50" :rules="nameRules" :label="$t('username')" required prepend-icon="mdi-account-circle" required />
            <v-text-field :label="$t('password')" v-model="password" placeholder="password" prepend-icon="mdi-lock" :type="showPassword ? 'text' : 'password'" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword"
              required />
            <v-btn type="submit" class="mr-4" color="success">
              {{ $t('submit') }}
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-row>
  </v-dialog>
</v-container>
</template>

<script>
import {
  mapGetters,
  mapActions
  //mapMutations
} from 'vuex';
import notify from '@/plugins/nodefony/components/notify.vue';

export default {
  name: 'Login',
  data: () => ({
    dialog: true,
    message: null,
    showPassword: false,
    valid: true,
    username: 'admin',
    password: 'admin',
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
  }),
  components: {
    notify
  },
  computed: {
    ...mapGetters([
      'isLoading'
    ])
  },
  mounted() {

  },
  beforeUpdate() {

  },
  beforeDestroy() {

  },
  methods: {
    ...mapActions({
      auth: 'AUTH_REQUEST'
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
              this.dialog = false;
              window.location = '/app';
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

</style>
