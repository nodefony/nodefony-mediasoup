<template>
<v-dialog v-model="dialogQuit" persistent max-width="600">
  <v-row justify="center">
    <v-card min-width="600">
      <v-system-bar color="indigo darken-2" dark>
        <v-spacer></v-spacer>
        <v-icon @click="leave"> mdi-close</v-icon>
      </v-system-bar>
      <div class="pa-5">
        <v-card-title class="headline">
          Are you sure to want leave the room ?
        </v-card-title>
        <v-card-text>
          <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
              <v-avatar color="blue-grey" size="125">
                <span class="white--text headline">{{roomid}}</span>
              </v-avatar>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text id="disagree" @click="leave">Disagree</v-btn>
          <v-btn color="green darken-1" text id="agree" @click="leave">Agree</v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-row>
</v-dialog>
</template>
<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
export default {
  name: 'DialogQuit',
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {}
  },
  computed: {
    ...mapGetters([
      "dialogQuit"
    ])
  },
  mounted() {

  },
  methods: {
    ...mapMutations([
      'closeQuitDialog'
    ]),
    leave(event) {
      let response = null;
      switch (event.currentTarget.id) {
        case "agree":
          response = true;
          break;
        default:
          response = false;
      }
      this.$emit('response', response);
      this.closeQuitDialog();
    }
  },
}
</script>

<style scoped lang="scss">

</style>
