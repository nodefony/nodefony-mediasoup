<template>
<v-app id="inspire" class="main">
  <v-main>
    <!--v-container fluid-->
    <Bar />
    <Navigation />
    <router-view />
    <!--/v-container-->
  </v-main>
</v-app>
</template>

<script>
import Navigation from "@/components/Navigation";
import Bar from "@/components/Bar";
export default {
  name: 'App',
  components: {
    Bar,
    Navigation
  },
  data: () => ({
    //
  }),
};
</script>
<style>
.main {
  padding: 0px ! important;
  margin: 0px;
  height: 100%;
}
</style>
