<template>
<v-card>
  <v-system-bar>
    <slot name="system-bar">
      <v-icon>mdi-close</v-icon>
      <v-icon>mdi-checkbox-blank-outline</v-icon>
      <v-icon>mdi-minus</v-icon>
    </slot>
  </v-system-bar>
  <v-toolbar flat>
    <v-toolbar-title>{{title}}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>
  <v-card-text class="ma-0 pa-0">
    <slot></slot>
  </v-card-text>
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
      default: 'My Dashboard Item'
    }
  },
  components: {

  }
}
</script>



<style scoped lang="scss">

</style>
