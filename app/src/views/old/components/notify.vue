<template>
<div>

  <v-alert v-if="type ==='alert'" :type="newPdu.type" dense outlined :color="newPdu.color">
    <strong>{{newPdu.msgid}}</strong>
    {{newPdu.payload}}
  </v-alert>

  <v-snackbar v-if="type ==='snackbar'" :timeout="options.timeout" :top="options.top" :right="options.right" :multi-line="options.multiLine" :color="newPdu.color || color ">
    {{ newPdu.payload }}
    <v-btn v-if="options.timeout" color="red" text @click="visible = false">
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
      default: null
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
      visible: false,
      color: "primary"
    }
  },
  mounted() {
    console.log("mount")
  },
  computed: {
    newPdu() {
      return this.parse(this.pdu);
    }
  },
  watch: {
    pdu() {
      this.newPdu = this.parse(this.pdu);
    }
  },
  methods: {
    parse(pdu) {
      console.log("passsss")
      switch (true) {
        case pdu.severity <= 3:
          pdu.type = 'error';
          pdu.color = 'red';
          break;
        case pdu.severity === 4:
          pdu.type = 'warning';
          pdu.color = 'yellow';
          break;
        case pdu.severity === 5:
          pdu.type = 'info';
          pdu.color = 'blue';
          break;
        case pdu.severity === 6:
          pdu.type = 'success';
          pdu.color = 'green';
          break;
        case pdu.severity === 7:
          pdu.type = 'success';
          pdu.color = 'teal';
          break;
        default:
          pdu.type = 'info';
          pdu.color = 'teal';
      }
      return pdu;
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
