<template>
<v-toolbar outlined dense flat width="100%" class="ma-0 pa-0" style="top: 0;postion:fixed">
  <v-spacer></v-spacer>
  <v-menu :close-on-content-click="false" :nudge-width="200" offset-x>
    <template v-slot:activator="{ on, attrs }">
      <v-btn small class="mx-4" v-bind="attrs" v-on="on" rounded outlined>
        <v-icon left dark>
          mdi-page-layout-header-footer
        </v-icon>
        <span>
          Mise en Page
        </span>
      </v-btn>
    </template>
    <v-card>
      <v-list dense nav>
        <v-list-item-group v-model="selectedLayout" color="primary">
          <v-list-item @click="selectLayout" key="grille">
            <v-list-item-icon>
              <v-icon color="indigo">
                mdi-grid
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Grille</v-list-item-title>
              <v-list-item-subtitle>all participants</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="selectLayout" key="focus">
            <v-list-item-icon>
              <v-icon color="indigo">
                mdi-focus-field
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Focus</v-list-item-title>
              <v-list-item-subtitle>Auto focus participants</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-menu>
</v-toolbar>
</template>


<script>
export default {
  name: 'RoomToolBarTop',
  props: {
    selected: {
      type: Number,
      default: 0
    }
  },
  data(vm) {
    return {
      selectedLayout: [vm.selected]
    }
  },
  mounted() {},
  computed: {

  },

  methods: {
    selectLayout(event) {
      this.$emit("layoutchange", this.selectedLayout, event);
    },

  }
}
</script>

<style scoped lang="scss">

</style>
