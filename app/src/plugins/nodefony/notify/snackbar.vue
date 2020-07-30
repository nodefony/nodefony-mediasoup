<script>
export default {
  name: 'snackBar',
  props: {
    top: null,
    right: null,
    timeout: null,
    multiLine: null,
    color: null
  },
  data() {
    return {
      visible: true,
      pdu: null,
    }
  }
}
</script>

<template>
<v-snackbar :timeout="timeout" :top="top" :right="right" v-model="visible" :multi-line="multiLine" :color="pdu.color">
  {{ pdu.payload }}
  <v-btn color="red" text @click="visible = false">
    {{ $t('close') }}
  </v-btn>
</v-snackbar>
</template>

<i18n>
  {
    "en" : {
      "close" : "Close"
    },
    "fr" : {
      "close" : "Fermer"
    }
  }
</i18n>
