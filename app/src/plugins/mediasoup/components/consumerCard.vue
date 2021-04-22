<template>
<v-card width="100%" height="100%" ref="card">
  <v-list-item v-for="(key, value) in consumer.stats[0]" :key="`${consumer.id}-stats`">
    <v-list-item-content>
      <v-list-item-subtitle>{{value}}</v-list-item-subtitle>
      <v-list-item-title class="headline">
        {{key}}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</v-card>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'consumerCard',
  props: {
    consumer: {
      type: Object,
      default: null
    },
    graph: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {

    }
  }
}
</script>

<style scoped>
/* local styles */
</style>
