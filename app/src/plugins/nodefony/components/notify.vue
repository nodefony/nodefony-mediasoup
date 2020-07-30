<template>
<div>

  <v-alert v-if="type ==='alert'" :type="pdu.type" dense outlined :color="pdu.color">
    <strong>{{pdu.msgid}}</strong>
    {{pdu.payload}}
  </v-alert>

  <v-snackbar v-if="type ==='snackbar'" :timeout="options.timeout" :top="options.top" :right="options.right" v-model="pdu" :multi-line="options.multiLine" :color="pdu.color">
    {{ pdu.payload }}
    <v-btn color="red" text @click="visible = false">
      {{ $t('close') }}
    </v-btn>
  </v-snackbar>
</div>
</template>

<script>
export default {
  name: 'nodefony-notify',
  props: {
    type: {
      type: String,
      default: "snackbar"
    },
    pdu: {
      type: Object,
      default: function() {
        return {
          payload: "No Content",
          type: "warning",
          msgid: "Alert"
        }
      }
    },
    options: {
      type: Object,
      default: function() {
        return {
          timeout: 2000,
          multiLine: true,
          top: true,
          right: false
        }
      }
    }
  },
  data() {
    return {
      visible: false
    }
  }
}
</script>

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
