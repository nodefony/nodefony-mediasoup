<template>
<v-app id="mediasoup">
  <Navigation />
  <Bar />
  <!-- Sizes your content based upon application components -->
  <v-main>
    <!-- Provides the application the proper gutter -->
    <v-container fluid full-height class="pa-0">
      <!-- If using vue-router -->
      <router-view></router-view>
    </v-container>
  </v-main>
  <!--v-footer app>
  </v-footer-->
</v-app>
</template>

<script>
import Navigation from "@/components/layouts/Navigation"
import Bar from "@/components/layouts/Bar"
export default {
  name: 'App',
  components: {
    Bar,
    Navigation
  },
  data: () => ({

  }),
};
</script>
<style lang="scss">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}
</style>
