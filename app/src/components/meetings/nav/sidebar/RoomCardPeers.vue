<template>
<div>
  <v-card class="mx-auto" min-width="100%" min-height="100%">
    <v-virtual-scroll :items="items" :item-height="50" height="500">
      <template v-slot:default="{ item }">
        <v-list-item>
          <v-list-item-avatar>
            <v-avatar :color="item.color" size="56" class="white--text">
              <v-img :src="item.avatar"></v-img>
            </v-avatar>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title v-html="item.name"></v-list-item-title>
            <v-list-item-subtitle v-html="item.subtitle"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </v-card>
</div>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
export default {
  name: 'Peers',
  data(vm) {
    return {

    }
  },
  props: {},
  computed: {
    ...mapGetters([
      'peers'
    ]),
    items() {
      let tab = [];
      for (let i = 0; i < this.peers.length; i++) {
        tab.push({
          name: this.peers[i].id
        });
      }
      return tab;
    }
  },
  mount() {},
  methods: {

  }
}
</script>

<style scoped lang="scss">

</style>
