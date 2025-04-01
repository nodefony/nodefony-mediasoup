<template>
<v-card v-bind="{...$props, ...$attrs}" elevation="8" rounded="lg" style="z-index:0">
  <v-system-bar v-if="systemBar">
    <slot name="system-bar">
      <v-icon>mdi-close</v-icon>
      <v-icon>mdi-checkbox-blank-outline</v-icon>
      <v-icon>mdi-minus</v-icon>
    </slot>
  </v-system-bar>
  <v-toolbar dark class="mycolor" flat v-if="title">
    <v-toolbar-title>{{title}}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>
  <!--v-card-text class="ma-0 pa-0 rounded-lg">

  </v-card-text-->
  <slot></slot>
</v-card>
</template>
<script>
// @ is an alias to /src

export default {
  name: 'DashboardItem',
  data() {
    return {

    }
  },
  props: {
    title: {
      type: String,
      default: null
    },
    systemBar: {
      type: Boolean,
      default: false
    }
  },
  components: {

  }
}
</script>


<style scoped lang="scss">

</style>
