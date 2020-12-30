<template>
<!--v-app-bar /*:clipped-left="$vuetify.breakpoint.lgAndUp"*/ app-->
<v-app-bar v-if="navbar" app>
  <v-app-bar-nav-icon @click.stop="toogleDrawer"></v-app-bar-nav-icon>
  <v-toolbar-title style="width: 300px" class="ml-0 pl-4">
    <router-link :to="{ name: 'Home'}" tag="div">
      <v-btn text>
        <span class="hidden-sm-and-down">Nodefony Mediasoup FSU</span>
      </v-btn>
    </router-link>
  </v-toolbar-title>

  <v-spacer></v-spacer>

  <!-- LANGAGE -->
  <v-menu>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-subheader>{{$t("traduction")}}</v-subheader>
      <v-list-item-group v-model="selectedLang" color="primary">
        <v-list-item v-for="(item, i) in langs" :key="i" @click="changeLang(item)">
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>


  <router-link :to="{ name: 'About'}" tag="div">
    <v-btn icon v-if="isAuthenticated">
      <v-icon>mdi-apps</v-icon>
    </v-btn>
  </router-link>
  <v-btn icon v-if="isAuthenticated">
    <v-icon>mdi-bell</v-icon>
  </v-btn>
  <v-btn icon v-if="isAuthenticated" class="text-transform-none">
    <v-menu v-model="account" :close-on-content-click="false" :nudge-width="200" offset-x>
      <template v-slot:activator="{ on, attrs }">
        <v-list-item-avatar v-bind="attrs" v-on="on" color="blue-grey">
          <!--img src="" alt=""-->
          <span class="white--text">{{getTrigramme}}</span>
        </v-list-item-avatar>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar color="blue-grey">
              <!--img src="" alt=""-->
              <span class="white--text">{{getTrigramme}}</span>
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
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deconnect">
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

  </v-btn>

  <!-- LOGIN -->
  <a v-else :href="$router.resolve({ name: 'Login' }).href">
    <v-btn v-if="!isLogging" rounded color="primary" dark>
      Login
    </v-btn>
  </a>

</v-app-bar>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'Bar',
  components: {},
  props: {},
  data(vm) {
    return {
      account: false,
      selectedLang: 0,
      langs: [{
          text: 'francais',
          icon: 'mdi-clock',
          locale: 'fr'
        },
        {
          text: 'English',
          icon: 'mdi-account',
          locale: 'en'
        }
      ]
    }
  },
  mounted() {
    this.getLang();
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getTrigramme',
      'getNavBar',
      'getProfileName',
      'getProfileSurname'
    ]),
    navbar: {
      get() {
        return this.getNavBar;
      },
      set(value) {
        return value
      }
    },
    isLogging() {
      return this.$route.name === "Login";
    }
  },
  destroyed() {},
  async beforeMount() {
    if (!this.isAuthenticated || this.isLogging) {
      return;
    }
    if (!this.getProfile) {
      if (this.getUser && this.isAuthenticated) {
        return await this.getUserProfile(`/api/users/${this.getUser}`)
          .catch(() => {
            document.location = `/app/login`;
          });
      }
    }
  },
  methods: {
    ...mapActions({
      getUserProfile: 'USER_REQUEST',
      logout: 'AUTH_LOGOUT'
    }),
    ...mapMutations(['toogleDrawer']),
    changeLang(lang) {
      this.$root.$i18n.locale = lang.locale;
      window.sessionStorage.setItem("locale", lang.locale);
    },
    getLang() {
      this.langs.forEach((item, i) => {
        if (item.locale === this.$root.$i18n.locale) {
          this.selectedLang = i;
        }
      });
      return this.selectedLang
    },
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
