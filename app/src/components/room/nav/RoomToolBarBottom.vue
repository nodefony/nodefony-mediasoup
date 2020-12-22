<template>
<v-toolbar bottom outlined dense flat min-width="100%" style="position:fixed">
  <v-col class="text-center ma-0 pa-0" cols="9">
    <v-btn small class="mx-4" rounded outlined>
      <v-icon left dark>
        mdi-volume-high
      </v-icon>
      <span>
        demute audio
      </span>
    </v-btn>
    <v-btn small class="mx-4" rounded outlined>
      <v-icon left dark>
        mdi-video-outline
      </v-icon>
      <span>
        Start video
      </span>
    </v-btn>
    <v-btn small class="mx-4" rounded outlined>
      <v-icon left dark>
        mdi-monitor-share
      </v-icon>
      <span>
        Share screen
      </span>
    </v-btn>
    <v-btn small class="mx-6" fab dark color="red" @click="quit">
      <v-icon dark>
        mdi-close
      </v-icon>
    </v-btn>
  </v-col>
  <v-spacer></v-spacer>
  <v-col class="" cols="3">
    <v-btn-toggle v-model="drawer" multiple rounded small>
      <v-btn small>
        <v-icon left dark>
          mdi-account-multiple
        </v-icon>
        <span>
          Participants
        </span>
      </v-btn>
      <v-btn small>
        <v-icon left dark>
          mdi-message-text
        </v-icon>
        <span>
          Chat
        </span>
      </v-btn>
    </v-btn-toggle>
  </v-col>
</v-toolbar>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'RoomToolBarBottom',
  props: {

  },
  data(vm) {
    return {

    }
  },
  computed: {
    drawer: {
      set(value) {
        this.$store.commit('setSideBar', value)
      },
      get() {
        return this.$store.getters.getSideBar;
      }
    }
  },
  mounted() {},
  methods: {
    quit(event) {
      this.$emit("quit", event);
    }
  },
}
</script>

<style scoped lang="scss">

</style>
