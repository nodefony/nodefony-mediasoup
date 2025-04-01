<template>
<v-date-picker light reactive full-width :locale="locale" color="mycolor" v-model="pickerFocus" @click:date="pickerClickDay" @click:month="pickerClickMonth" :events="functionEvent" @update:picker-date="change">
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
    today: false,
    myevents: null,
    currentDate: new Date(),
    currentMonth: null
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
    events(ele) {
      if (ele === null) {
        this.getEventMonth()
      } else {
        this.myevents = []
      }
    },
    focus(date) {
      if (date && date === '' || !date) {
        this.currentDate = new Date(Date.now());
        //this.currentMonth = this.currentDate.getMonth()
      } else {
        this.currentDate = new Date(date);
      }
    }
  },

  async mounted() {},
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
    pickerEvents() {
      let map = new Map();
      if (this.events && this.events.length) {
        this.myevents = this.events
      }
      if (this.myevents && this.myevents.length) {
        this.myevents.map((event) => {
          let ev = this.events && event.event ? event.event : event
          if (!ev.start && !ev.end) {
            //task
            return
          }
          if (!ev.end) {
            return
          }
          let dateStart = new Date(ev.start.dateTime)
          let dateEnd = new Date(ev.end.dateTime)
          let day = dateStart.getDate()
          const month = dateStart.getMonth()
          let dayEnd = dateEnd.getDate()
          const monthEnd = dateEnd.getMonth()
          if (day !== dayEnd) {
            //console.log("START ", dateStart, day, month)
            //console.log("END ", dateEnd, dayEnd, monthEnd)
            //console.log(dayEnd - day)
            if (month !== monthEnd) {
              //console.log(this.currentMonth)
              const lastDayStart = new Date(dateStart.getFullYear(), dateStart.getMonth() + 1, 0);
              //console.log(lastDayStart.getDate(), lastDayStart.getMonth())
              if (this.currentMonth !== lastDayStart.getMonth()) {
                day = 1
              }
              const lastDayEnd = new Date(dateEnd.getFullYear(), dateEnd.getMonth() + 1, 0);
              if (this.currentMonth !== lastDayEnd.getMonth()) {
                dayEnd = lastDayEnd.getDate()
              }
            }
            //console.log(day, dayEnd)
            for (let i = day; i <= dayEnd; i++) {
              //console.log("set day ", i)
              let key = map.get(i)
              if (key) {
                key.push(ev.colorId)
              } else {
                let array = [ev.colorId]
                map.set(i, array)
              }
            }
          } else {
            let key = map.get(day)
            if (key) {
              key.push(ev.colorId)
            } else {
              let array = [ev.colorId]
              map.set(day, array)
            }
          }
          return map
        })
      }
      return map
    }
  },
  methods: {
    ...mapActions([
      'getRemoteEventsMonth',
    ]),
    pickerClickDay(date) {
      return this.$emit("click-day", date)
    },
    pickerClickMonth(date) {
      return this.$emit("click-month", date)
    },
    async change(mydate) {
      let date = new Date(mydate)
      const dateMonth = date.getMonth();
      let month = null;
      if (this.currentDate) {
        month = this.currentDate.getMonth();
      }
      //console.log("change", date, this.events, this.currentDate, dateMonth, month)
      if (this.events) {
        this.currentMonth = month
      } else {
        if ((month !== dateMonth) || this.currentMonth === null) {
          this.myevents = []
          //USER_REQUEST
          this.currentDate = date
          //console.log("EVENT_REQUEST")
          await this.getEventMonth();
        } else {
          this.currentMonth = month
        }
      }
      //console.log(`change  request : ${!this.events}`, `month : ${month}  current : ${this.currentMonth}`)
      if (this.today) {
        this.today = false
        return
      }
      if (reg.test(mydate)) {
        this.$emit("click-change", mydate)
      }
    },
    functionEvent(date) {
      //console.log("passs functionEvent  ", date)
      const [, , day] = date.split('-')
      const eventDay = this.pickerEvents.get(parseInt(day, 10))
      if (eventDay) {
        return eventDay
      }
      return false
    },
    async getEventMonth() {
      return await this.getRemoteEventsMonth({
          id: this.calendar.id,
          month: this.currentDate
        })
        .then((result) => {
          this.myevents = result
          this.currentMonth = this.currentDate.getMonth()
          return result;
        })
    }

  }
}
</script>

<style scoped lang="scss">
</style>
