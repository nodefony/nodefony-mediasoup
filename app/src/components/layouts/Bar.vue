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
    <v-btn icon>
      <v-icon>mdi-apps</v-icon>
    </v-btn>
  </router-link>
  <v-btn icon>
    <v-icon>mdi-bell</v-icon>
  </v-btn>
  <v-btn icon v-if="isAuthenticated">
    <v-avatar color="blue-grey" size="32">
      <span class="white--text">{{getTrigramme}}</span>
    </v-avatar>
  </v-btn>

  <!-- LOGIN -->
  <a v-else :href="$router.resolve({ name: 'Login' }).href">
    <v-btn rounded color="primary" dark>
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
      'getNavBar'
    ]),
    navbar: {
      get() {
        return this.getNavBar;
      },
      set(value) {
        return value
      }
    }
  },
  destroyed() {},
  async beforeMount() {
    if (!this.getProfile) {
      if (this.getUser && this.isAuthenticated) {
        return await this.getUserProfile(`/api/users/${this.getUser}`)
      }
    }
  },
  methods: {
    ...mapActions({
      getUserProfile: 'USER_REQUEST'
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
  }
}
</script>
