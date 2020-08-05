<template>
<v-app id="inspire">

  <v-main>
    <v-container fluid class="main">
      <router-view />
    </v-container>
  </v-main>

</v-app>
</template>

<script>
export default {
  name: 'App',
  components: {},
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
