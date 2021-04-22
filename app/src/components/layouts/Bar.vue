<template>
<!--v-app-bar /*:clipped-left="$vuetify.breakpoint.lgAndUp"*/ app-->
<v-app-bar v-if="navbar" app>
  <v-app-bar-nav-icon @click.stop="toogleDrawer"></v-app-bar-nav-icon>
  <v-toolbar-title style="width: 300px" class="ml-0 pl-4">

    <router-link :to="{ name: 'Home'}" custom v-slot="{ navigate }">
      <div>
        <v-btn text @click="navigate">
          <img src="../../assets/mediasoup.png" />
          <span class="hidden-sm-and-down ml-2">Nodefony Mediasoup FSU</span>
        </v-btn>
      </div>
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
          <!--v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon-->
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>

  <router-link :to="{ name: 'About'}" custom v-slot="{ navigate }">
    <div>
      <v-btn icon v-if="isAuthenticated" @click="navigate">
        <v-icon>mdi-apps</v-icon>
      </v-btn>
    </div>
  </router-link>

  <v-btn icon v-if="isAuthenticated">
    <v-icon>mdi-bell</v-icon>
  </v-btn>
  <bar-avatar v-if="isAuthenticated" />
  <!--v-btn icon v-if="isAuthenticated" class="text-transform-none">
    <v-menu v-model="account" :close-on-content-click="false" :nudge-width="200" offset-x>
      <template v-slot:activator="{ on, attrs }">
        <v-list-item-avatar v-bind="attrs" v-on="on" color="blue-grey">

          <span class="white--text">{{getTrigramme}}</span>
        </v-list-item-avatar>
      </template>
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-avatar color="blue-grey">

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
  </v-btn-->

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
import BarAvatar from '@/components/layouts/avatar.vue';
export default {
  name: 'Bar',
  components: {
    "bar-avatar": BarAvatar
  },
  props: {},
  data() {
    return {
      //account: false,
      hiddeDrawder: false,
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
    if (this.$route.name === "Login") {
      this.hiddeDrawder = true;
    } else {
      this.hiddeDrawder = false;
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      //'getTrigramme',
      'getNavBar',
      //'getProfileName',
      //'getProfileSurname'
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
          .then((ele) => {
            let tab = this.getProfile.lang.split("_");
            if (tab[1] !== this.$root.$i18n.locale) {
              for (let ele of this.langs) {
                if (ele.locale === tab[1]) {
                  this.changeLang(ele);
                }
              }
            }
            return ele;
          })
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
      this.getLang();
    },
    getLang() {
      this.langs.forEach((item, i) => {
        if (item.locale === this.$root.$i18n.locale) {
          this.selectedLang = i;
        }
      });
      return this.selectedLang;
    }
    /*async deconnect() {
      await this.logout()
        .then((res) => {
          document.location = `/app/login`;
          return res;
        })
    }*/
  }
}
</script>

<style scoped lang="scss">

</style>
