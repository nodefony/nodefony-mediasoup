<template>
<v-card elevation="1" min-width="100%" class="">
  <v-virtual-scroll :items="peers" height="300" item-height="64">
    <v-list-item-action>
      <v-btn fab small depressed color="primary">
        {{ peer.id }}
      </v-btn>
    </v-list-item-action>

    <v-list-item-content>
      <v-list-item-title>
        User Database Record <strong>ID {{ peer.id }}</strong>
      </v-list-item-title>
    </v-list-item-content>

    <v-list-item-action>
      <v-icon small>
        mdi-open-in-new
      </v-icon>
    </v-list-item-action>
    </v-list-item>
    <template v-slot:default="{ item }">
      <v-list-item :key="item">
        <v-list-item-action>
          <v-btn fab small depressed color="primary">
            {{ item.id }}
          </v-btn>
        </v-list-item-action>

        <v-list-item-content>
          <v-list-item-title>
            User Database Record <strong>ID {{ item.id }}</strong>
          </v-list-item-title>
        </v-list-item-content>

        <v-list-item-action>
          <v-icon small>
            mdi-open-in-new
          </v-icon>
        </v-list-item-action>
      </v-list-item>

      <v-divider></v-divider>
    </template>
  </v-virtual-scroll>
</v-card>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
export default {
  name: 'MenuPeers',
  data(vm) {
    return {

    }
  },
  props: {},
  computed: {
    ...mapGetters({
      room: 'getRoom',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'peers'
    ]),

  },
  mount() {},
  methods: {

  }
}
</script>

<style scoped lang="scss">

</style>
