<template>
<v-btn x-small v-bind="$attrs">
  <span v-if="!muted">
    <v-icon v-if="this.volume && this.volume < -50 && this.volume >= -100">mdi-volume-low</v-icon>
    <v-icon v-if="this.volume && this.volume >= -50 && this.volume <= -25">mdi-volume-medium</v-icon>
    <v-icon v-if="this.volume && this.volume > -25 ">mdi-volume-high</v-icon>
  </span>
  <v-icon v-else class="white--text">mdi-volume-off</v-icon>
</v-btn>
</template>

<script>
export default {
  name: 'Volume',
  props: {
    volume: {
      type: Number,
      default: -100
    },
    muted: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({

  })
}
</script>

<style scoped lang="scss">

</style>
