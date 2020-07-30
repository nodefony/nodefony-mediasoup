
<script>
// @ is an alias to /src
const version = process.env.VUE_APP_VERSION;
export default {
  name: 'About',
  data(vm) {
    return {
      version: version,
      vueVersion: this.$nodefony.vueVersion,
      vuetifyVersion: this.$nodefony.vuetifyVersion,
      mediasoupVersion: this.$mediasoup.version
    };
  },
  components: {},
  methods: {},
  mounted() {
    this.$mediasoup.connect();
  },
  created() {},
  watch: {},
  beforeUpdate() {},
  beforeDestroy() {

  }
}
</script>

<template>
<v-container>


  <v-row justify="center" align="center">
    <p class="text-center display-2">
      <h1>m
        <span class="highlight small">e</span>
        dia
        <span class="highlight">
          <span class="merge">s
          </span>oup
        </span>
      </h1>
      <img src="../assets/mediasoup.png">
      <v-chip class="ma-2" color="success" outlined>
        {{ mediasoupVersion }}
      </v-chip>
    </p>
  </v-row>

  <v-row justify="center" align="center" class="mt-6">

  </v-row>

  <v-row justify="center" align="center" class="mt-6">
    <v-avatar>
      <img src="../assets/vue.png" alt="vue.js">
    </v-avatar>
    <v-chip class="ma-2" color="success" outlined>
      {{vueVersion}}
    </v-chip>

    <v-avatar class="ml-4">
      <img src="../assets/nodefony.png" alt="nodefony">
    </v-avatar>
    <v-chip class="ma-2" color="success" outlined>
      {{$nodefony.version}}
    </v-chip>
    <v-avatar class="ml-4">
      <img src="../assets/vuetify-logo-light.png" alt="nodefony">
    </v-avatar>
    <v-chip class="ma-2" color="success" outlined>
      {{vuetifyVersion}}
    </v-chip>


  </v-row>

  <v-row align="center" justify="center">
    <img style="" src="../assets/mediasoup-v3-architecture-01.svg" />
  </v-row>

</v-container>
</template>

<style scoped lang="scss">
body h1 span.highlight {
    color: #1fb7e8;
}
body h1 span.merge {
    letter-spacing: -0.1em;
}

body h1 span.small {
    font-size: 0.85em;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 5s;
}
/* .fade-leave-active below version 2.1.8 */
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
