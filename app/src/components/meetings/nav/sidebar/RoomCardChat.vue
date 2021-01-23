<template>
<div>
  <v-responsive max-width="400" class="mx-auto mb-4">
    <v-textarea v-model="post" outlined filled auto-grow label="Enter message" rows="4" row-height="30" shaped></v-textarea>
  </v-responsive>

  <v-card elevation="3" min-width="100%" style="border:none">
    <v-timeline dense clipped>
      <!--v-virtual-scroll :items="posts" height="100%" item-height="64">
        <template v-slot:default="{ post }"-->
      <v-timeline-item v-for="(post, index) in 100" :key="index" class="mb-4" color="grey" icon-color="grey lighten-2" small>
        <v-row justify="space-between">
          <v-col cols="7">
            {{index}}
          </v-col>
          <v-col class="text-right" cols="5">
            15:26 EDT
          </v-col>
        </v-row>
      </v-timeline-item>
      <!--/template>
      </v-virtual-scroll-->
    </v-timeline>
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
  name: 'MenuChat',
  data(vm) {
    return {
      posts: [{
        message: "sfqsdfqlsdfjsldfjqs"
      }, {
        message: "mmqmqmqmqmqmqmqmqmqmqm"
      }],
      post: ""
    }
  },
  computed: {
    ...mapGetters({
      room: 'getRoom',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'peers'
    ])

  },
  mount() {},
  methods: {
    genRandomIndex(length) {
      return Math.ceil(Math.random() * (length - 1))
    },
  },
}
</script>

<style scoped lang="scss">

</style>
