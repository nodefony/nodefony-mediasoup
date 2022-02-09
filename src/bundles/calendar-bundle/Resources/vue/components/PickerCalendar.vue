<template>
<v-date-picker light reactive full-width :locale="locale" color="mycolor" v-model="pickerFocus" @click:date="pickerClickDay" @click:month="pickerClickMonth" :events="functionEvents" @update:picker-date="change">
</v-date-picker>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
const reg = /(....)-(..?)$/
export default {
  name: "Picker",
  components: {

  },
  data: () => ({
    today: false
    //pickerDate: null,
    //pickerFocus: null
  }),
  props: {
    events: {
      type: Array,
      default: null
    },
    calendar: {
      type: Object,
      default: null
    },
    focus: {
      type: String
    }
  },
  watch: {

  },

  mounted() {
    //this.pickerFocus = this.focus
  },
  computed: {
    locale() {
      return this.$root.$i18n.locale;
    },
    pickerFocus: {
      get() {
        if (this.focus && this.focus !== '') {
          return this.focus
        } else {
          this.today = true
          return (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
        }
      },
      set(date) {
        if (date && date !== '') {
          return date
        } else {
          this.today = true
          return (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10)
        }
      }
    },
  },
  methods: {
    pickerClickDay(date) {
      return this.$emit("click-day", date)
    },
    pickerClickMonth(date) {
      return this.$emit("click-month", date)
    },
    change(date) {
      if (this.today) {
        this.today = false
        return
      }
      console.log(this.pickerFocus)
      if (reg.test(date)) {
        console.log("change", date)
        this.$emit("click-change", date)
      }
    },
    functionEvents(date) {
      //return this.$emit("events-date", date)
      //console.log(date)
      const [, , day] = date.split('-')
      if ([12, 17, 28].includes(parseInt(day, 10))) return true
      if ([1, 19, 22].includes(parseInt(day, 10))) return ['red', '#00f']
      return false
    }

  }
}
</script>

<style scoped lang="scss">
</style>
