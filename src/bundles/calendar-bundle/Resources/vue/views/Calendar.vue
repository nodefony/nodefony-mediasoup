<template>
<v-window class="overflow-auto">
  <v-sheet fixed height="64">
    <v-toolbar flat fixed outlined style="">
      <v-icon>mdi-calendar-account-outline</v-icon>
      <v-toolbar-title class="px-5">{{ currentCalendar.summary }}</v-toolbar-title>
      <v-toolbar-title class="px-5">{{ currentCalendar.description  }}</v-toolbar-title>
    </v-toolbar>
  </v-sheet>
  <v-sheet height="48">
    <v-toolbar dense flat outlined style="">
      <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
        Today
      </v-btn>
      <v-btn fab text small color="grey darken-2" @click="prev">
        <v-icon small>
          mdi-chevron-left
        </v-icon>
      </v-btn>
      <v-btn fab text small color="grey darken-2" @click="next">
        <v-icon small>
          mdi-chevron-right
        </v-icon>
      </v-btn>
      <v-toolbar-title v-if="$refs.calendar">
        {{ $refs.calendar.title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-menu bottom right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn outlined color="grey darken-2" v-bind="attrs" v-on="on">
            <span>{{ typeToLabel[mytype] }}</span>
            <v-icon right>
              mdi-menu-down
            </v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="mytype = 'day'">
            <v-list-item-title>Day</v-list-item-title>
          </v-list-item>
          <v-list-item @click="mytype = 'week'">
            <v-list-item-title>Week</v-list-item-title>
          </v-list-item>
          <v-list-item @click="mytype = 'month'">
            <v-list-item-title>Month</v-list-item-title>
          </v-list-item>
          <v-list-item @click="mytype = '4day'">
            <v-list-item-title>4 days</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </v-sheet>

  <v-sheet height="fill-height">
    <!--v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay-->
    <v-calendar v-if="ready" ref="calendar" v-model="focus" :locale="locale" color="primary" :type="mytype" :events="events" :event-color="getEventColor" :event-ripple="false" @change="getRemoteEvents" @mousedown:event="startDrag" @click:event="showEvent"
      @mousedown:time="startTime" @mousemove:time="mouseMove" @mouseup:time="endDrag" @mouseleave.native="cancelDrag">

      <template v-slot:event="{ event, timed, eventSummary }">
        <div class="v-event-draggable" v-html="eventSummary()"></div>
        <div v-if="timed" class="v-event-drag-bottom" @mousedown.stop="extendBottom(event)"></div>
      </template>

      <!--template v-slot:day="{ event }">
        <div> {{event}}</div>
      </template-->

    </v-calendar>

    <event-item v-if="addEvent" :calendar="cal" :event="createEvent" :selectedEvent="selectedEvent" @cancel="cancelFormEvent" @valid="validFormEvent"></event-item>

  </v-sheet>
</v-window>
</template>

<script>
import {
  tz
} from "moment-timezone";
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import EventItem from '@../../../src/bundles/calendar-bundle/Resources/vue/components/Event';
import nodefony from 'nodefony-client';
export default {
  name: "calendar",
  components: {
    "event-item": EventItem
  },
  data: () => ({
    ready: false,
    focus: '',
    overlay: false,
    mytype: "week",
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4', '#4CAF50', '#FF9800', '#757575'],
    //names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
    addEvent: false,
    dragEvent: null,
    dragStart: null,
    createEvent: null,
    createStart: null,
    extendOriginal: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    currentIndexEvent: null,
    currentCalendar: {},
  }),
  props: {
    id: null,
    type: {
      type: String,
      default: "week"
    }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getLocale'
    ]),
    locale() {
      return this.$root.$i18n.locale;
    },
    cal() {
      return this.ready ? this.$refs.calendar : null
    },
    nowY() {
      return this.cal ? this.cal.timeToY(this.cal.times.now) + 'px' : '-10px'
    },

    myTimeZone() {
      let code = tz.zonesForCountry(this.getLocale[3])
      return {
        zone: this.currentCalendar.timeZone,
        utc: tz(code).format('(zZ)')
      }
    },
    timezone() {
      return {
        zone: this.currentCalendar.timeZone,
        utc: tz(this.currentCalendar.timeZone).format('(zZ)')
      }
    }
  },
  async mounted() {
    //this.$refs.calendar.checkChange()
    this.mytype = this.type;
    if (this.isAuthenticated) {
      await this.getCalendar(this.id)
      this.ready = true
      //this.cal.scrollToTime('20:00')
      //this.cal.scrollToTime({
      //  hour: "20",
      //  minute: "30"
      //})
      //this.scrollToTime()
      //this.updateTime()
    }
  },

  methods: {
    async getRemoteEvents({
        start,
        end
      },
      id = this.id) {
      this.overlay = true;
      let options = {
        headers: {
          "Content-Type": "application/json"
        }
      }
      if (start && end) {
        options = nodefony.extend(true, {}, options, {
          body: JSON.stringify({
            start: start,
            end: end
          })
        })
      }
      return await this.$nodefony.request(`events/calendar/${id}/events`, "POST", options)
        .then(async (res) => {
          this.events = [];
          const calendarEvents = res.result;
          calendarEvents.map((item) => {
            console.log(item)
            console.log(JSON.parse(item.iCalUID))
            let mystart = new Date(item.start)
            let myend = new Date(item.end)
            const timed = myend.getDate() === mystart.getDate();
            this.events.push({
              name: item.summary,
              start: mystart.getTime(),
              end: myend.getTime(),
              color: item.colorId || 'primary',
              timed: timed
            })
          })
          this.overlay = false;
        }).catch(e => {
          console.log(e)
          this.overlay = false;
        })
    },

    async getCalendar(id) {
      return await this.$nodefony.request(`calendar/calendar/${id}`, "GET", {})
        .then((res) => {
          this.currentCalendar = res.result;
          return this.currentCalendar
        })
    },

    getCurrentTime() {
      return this.cal ? this.cal.times.now.hour * 60 + this.cal.times.now.minute : 0
    },
    scrollToTime() {
      const time = this.getCurrentTime()
      console.log(time)
      const first = Math.max(0, time - (time % 30) - 30)
      console.log(first)
      this.cal.scrollToTime(first)
    },
    updateTime() {
      setInterval(() => this.cal.updateTimes(), 60 * 1000)
    },
    showEvent({
      nativeEvent,
      event
    }) {
      const open = () => {
        console.log("open event nativeEvent")
        console.log(event, nativeEvent)
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() => requestAnimationFrame(() => this.addEvent = true))
      }
      if (this.addEvent) {
        this.addEvent = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }
      nativeEvent.stopPropagation()
    },
    viewDay({
      date
    }) {
      this.focus = date
      this.mytype = 'day'
    },

    setToday() {
      this.focus = ''
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
    startDrag({
      event,
      timed
    }) {
      if (event && timed) {
        this.dragEvent = event
        this.dragTime = null
        this.extendOriginal = null
      }
    },
    startTime(tms) {
      const mouse = this.toTime(tms)
      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start
        this.dragTime = mouse - start
        console.log("startTime already created")
      } else {
        this.createStart = this.roundTime(mouse)
        console.log("startTime createEvent")
        this.createEvent = {
          name: `Event#${this.events.length}`,
          color: this.rndElement(this.colors),
          start: this.createStart,
          end: this.createStart,
          timed: true,
        }
        const index = this.events.push(this.createEvent)
        this.currentIndexEvent = index - 1;
      }
    },
    async endDrag(tms) {
      console.log("endDrag")
      if (this.createEvent) {
        await this.createFormEvent()
      }
      console.log("endDrag after await")
      this.dragTime = null
      this.dragEvent = null
      this.createEvent = null
      this.createStart = null
      this.extendOriginal = null
    },
    createFormEvent(tms) {
      this.addEvent = true
    },
    validFormEvent(data) {
      return new Promise((resolve, reject) => {
          console.log(data)
          this.addEvent = false;
          return resolve()
        })
        .catch(() => {
          this.cancelFormEvent()
        })
    },
    cancelFormEvent() {
      if (this.currentIndexEvent !== null) {
        this.log("delte index event")
        this.events.splice(this.currentIndexEvent, 1)
      }
      this.cleanDragDrop()
    },

    cleanDragDrop() {
      this.currentIndexEvent = null;
      this.addEvent = false;
      this.dragTime = null
      this.dragEvent = null
      this.createEvent = null
      this.createStart = null
      this.extendOriginal = null
    },

    extendBottom(event) {
      console.log("mouse stop  extendBottom")
      this.createEvent = event
      this.createStart = event.start
      this.extendOriginal = event.end
    },
    mouseMove(tms) {
      const mouse = this.toTime(tms)
      if (this.dragEvent && this.dragTime !== null) {
        const start = this.dragEvent.start
        const end = this.dragEvent.end
        const duration = end - start
        const newStartTime = mouse - this.dragTime
        const newStart = this.roundTime(newStartTime)
        const newEnd = newStart + duration
        this.dragEvent.start = newStart
        this.dragEvent.end = newEnd
        this.end = new Date(this.dragEvent.end)
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false)
        const min = Math.min(mouseRounded, this.createStart)
        const max = Math.max(mouseRounded, this.createStart)
        this.createEvent.start = min
        this.createEvent.end = max
      }
    },

    cancelDrag(...args) {
      console.log("cancel drag", args)
      return;
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal
          this.end = new Date(this.createEvent.end)
        } else {
          const i = this.events.indexOf(this.createEvent)
          if (i !== -1) {
            this.events.splice(i, 1)
          }
        }
      }
      this.createEvent = null
      this.createStart = null
      this.dragTime = null
      this.dragEvent = null
    },
    roundTime(time, down = true) {
      const roundTo = 15 // minutes
      const roundDownTime = roundTo * 60 * 1000
      return down ?
        time - time % roundDownTime :
        time + (roundDownTime - (time % roundDownTime))
    },
    toTime(tms) {
      return new Date(tms.year, tms.month - 1, tms.day, tms.hour, tms.minute).getTime()
    },
    getEventColor(event) {
      const rgb = parseInt(event.color.substring(1), 16)
      const r = (rgb >> 16) & 0xFF
      const g = (rgb >> 8) & 0xFF
      const b = (rgb >> 0) & 0xFF

      return event === this.dragEvent ?
        `rgba(${r}, ${g}, ${b}, 0.7)` :
        event === this.createEvent ?
        `rgba(${r}, ${g}, ${b}, 0.7)` :
        event.color
    },
    /*async getEvents({
      start,
      end
    }) {
      console.log(start, end, `${start.date}T00:00:00`, `${end.date}T23:59:59`)
      const min = new Date(`${start.date}T00:00:00`).getTime()
      const max = new Date(`${end.date}T23:59:59`).getTime()
      const days = (max - min) / 86400000
      const eventCount = this.rnd(days, days + 20)

      for (let i = 0; i < eventCount; i++) {
        const timed = this.rnd(0, 3) !== 0
        const firstTimestamp = this.rnd(min, max)
        const secondTimestamp = this.rnd(2, timed ? 8 : 288) * 900000
        const start = firstTimestamp - (firstTimestamp % 900000)
        const end = start + secondTimestamp
        this.events.push({
          name: this.rndElement(this.names),
          color: this.rndElement(this.colors),
          start,
          end,
          timed,
        })
      }
    },*/


    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a
    },
    rndElement(arr) {
      return arr[this.rnd(0, arr.length - 1)]
    },
  },
}
</script>

<style scoped lang="scss">
.v-event-draggable {
    padding-left: 6px;
}
.v-event-timed {
    user-select: none;
    -webkit-user-select: none;
}
.v-event-drag-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 4px;
    height: 4px;
    cursor: ns-resize;
    &::after {
        display: none;
        position: absolute;
        left: 50%;
        height: 4px;
        border-top: 1px solid white;
        border-bottom: 1px solid white;
        width: 16px;
        margin-left: -8px;
        opacity: 0.8;
        content: '';
    }
    &:hover::after {
        display: block;
    }
}
</style>
