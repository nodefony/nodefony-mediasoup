<template>
<v-btn icon v-bind="{...$props, ...$attrs}" v-if="isAuthenticated" class="text-transform-none">
  <v-menu v-model="account" :close-on-content-click="false" :nudge-width="200" offset-x>
    <template v-slot:activator="{ on, attrs }">
      <v-list-item-avatar v-bind="attrs" v-on="on" :color="color">
        <!--img src="" alt=""-->
        <span class="white--text">{{getInitials}}</span>
      </v-list-item-avatar>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-avatar :color="color">
            <!--img src="" alt=""-->
            <span class="white--text">{{getInitials}}</span>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{getProfileName}}</v-list-item-title>
            <v-list-item-subtitle>{{getProfileSurname}}</v-list-item-subtitle>
          </v-list-item-content>

          <v-list-item-action>

          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
      <v-card-actions v-if="isAuthenticated">
        <v-spacer></v-spacer>
        <slot name="actions">
          <v-btn text @click="deconnect">
            Logout
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-menu>
</v-btn>
</template>

<script>
import {
  mapGetters,
  //mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'barAvatar',
  components: {},
  props: {
    color: {
      type: String,
      default: 'indigo darken-1'
    }
  },
  data() {
    return {
      account: false,
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getTrigramme',
      'getInitials',
      'getProfileName',
      'getProfileSurname'
    ]),

    isLogging() {
      return this.$route.name === "Login";
    }
  },
  methods: {
    ...mapActions({
      logout: 'AUTH_LOGOUT'
    }),
    async deconnect() {
      await this.logout()
        .then((res) => {
          document.location = `/app/login`;
          return res;
        })
    }
  }
}
</script>

<style scoped lang="scss">
.text-transform-none {
    text-transform: none !important;
}
</style>
