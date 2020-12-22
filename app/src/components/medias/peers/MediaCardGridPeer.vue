<template>
<v-card color="grey lighten-3" class="ma-1" max-height="100" min-width="200" height="100" width="200" idle>
  <v-row class="fill-height" align="center" justify="center">
    <v-card-title>{{peer.name}}</v-card-title>
  </v-row>
</v-card>
</template>


<script>
export default {
  name: 'MediaCardGridPeer',
  components: {

  },
  props: {
    peer: {
      type: Object
    },
    active: {
      type: Boolean
    }
  },
  data(vm) {
    return {

    }
  },
  computed: {

  },
  mounted() {
    console.log(this.active, this.peer)
  },
  methods: {


  },
}
</script>

<style scoped lang="scss">

</style>
