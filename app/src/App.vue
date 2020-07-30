<template>
<v-app id="inspire">

  <v-main>
    <v-container fluid>
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
