<template>
<v-container fluid class="pa-0 ma-0">
  <v-row class="pa-0 ma-0">
    <v-expansion-panels multiple accordion v-model="drawer">
      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:actions>
            <v-icon color="error">
              mdi-account-multiple
            </v-icon>
          </template>
          <div>
            Participants
            <v-badge bordered color="deep-purple accent-4" offset-x="-5" offset-y="-5" :content="peers.length">
            </v-badge>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <room-card-peers :peers="peers" />
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:actions>
            <v-icon color="error">
              mdi-message-text
            </v-icon>
          </template>
          Chat
        </v-expansion-panel-header>
        <v-expansion-panel-content id="innerExPan">
          <room-card-chat />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</v-container>
</template>


<script>
import CardChat from './RoomCardChat';
import CardPeers from './RoomCardPeers';
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'RoomSideBar',
  components: {
    "room-card-chat": CardChat,
    "room-card-peers": CardPeers,
  },
  props: {},
  data(vm) {
    return {}
  },
  mounted() {},
  computed: {
    ...mapGetters([
      'peers'
    ]),
    drawer: {
      set(value) {
        this.$store.commit('setSideBar', value)
      },
      get() {
        return this.$store.getters.getSideBar;
      }
    }
  },

  methods: {

  },
}
</script>

<style scoped lang="scss">

</style>
