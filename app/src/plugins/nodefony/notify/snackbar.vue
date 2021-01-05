<template>
<v-snackbar v-bind="{...$props, ...$attrs}" v-model="visible" :color="severityColor" :style="`margin-top:${margin}`">
  {{ pdu.payload }}
  <v-btn color="red" text @click="close">
    {{ $t('close') }}
  </v-btn>
</v-snackbar>
<!--v-snackbar v-bind="$props" absolute :timeout="timeout" :top="top" :right="right" v-model="visible" :multi-line="multiLine" :color="severityColor">
  {{ pdu.payload }}
  <v-btn color="red" text @click="visible=false">
    {{ $t('close') }}
  </v-btn>
</v-snackbar-->
</template>

<script>
export default {
  name: 'nodefonySnackBar',
  mixins: [],
  props: {
    top: null,
    absolute: {
      type: Boolean,
      default: false
    },
    right: null,
    timeout: {
      type: Number,
      default: -1
    },
    multiLine: null,
    color: {
      type: String,
      default: "primary"
    },
    pdu: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      visible: true,
      severityColor: null,
      stacked: 0
    }
  },
  computed: {
    margin() {
      return (this.stacked * 68) + 'px'
    }
  },
  mounted() {
    this.severityColor = this.pdu.type || this.color;
  },
  methods: {
    close() {
      this.visible = false;
    }
  },
  watch: {
    visible(value) {
      if (!value) {
        this.$emit("close", this.pdu)
      }
    }
  }
}
</script>
