<template>
<v-window>
  <v-card>
    <v-toolbar color="blue-grey" dark flat>
      <v-icon class="mr-5">mdi-home</v-icon>
      <v-toolbar-title> {{ $t('rooms.room') }} {{room? room.name : ""}}</v-toolbar-title>

      <v-spacer></v-spacer>
      <v-icon @click="close">mdi-close</v-icon>
      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab v-for="item in items" :key="item">
            {{ item === "info" ?  $t(`rooms.info`) : $t(`rooms.name`) }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="tab">
      <v-tab-item v-for="item in items" :key="item">
        <v-card v-if="item === 'room'" flat>
          <div v-if="room">
            <v-card-text>{{room.name}} {{item}}</v-card-text>
            <v-card-text>{{room.aceess}} {{item}}</v-card-text>
            <v-card-text>{{room.description}} {{item}}</v-card-text>
          </div>
        </v-card>
        <v-card v-if="item === 'info'" flat>
          <div v-if="room">
            <v-card-text>{{room.name}} {{item}}</v-card-text>
            <v-card-text>{{room.access}} {{item}}</v-card-text>
            <v-card-text>{{room.description}} {{item}}</v-card-text>
          </div>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</v-window>
</template>


<script>
import {
  mapGetters,
  mapActions,
  mapMutations
} from 'vuex';


export default {
  name: 'EditRoom',
  props: {
    room: {
      type: Object,
      default: null
    }
  },
  data: () => ({
    tab: null,
    items: [
      'room', 'info',
    ]
  }),
  async mounted() {
    if (this.room) {
      console.log("monted", this.room.name)
    }

  },
  destroyed() {
    //console.log("destroyed", this.room.name)
  },
  watch: {

  },
  computed: {

  },
  methods: {
    async deleteRoom() {
      console.log("remove")
    },
    close() {
      return this.$emit("close", this.room)
    }
  }
}
</script>
