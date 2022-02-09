<template>
<!--v-container fluid class="transparent pa-0 ma-0"-->
<!--object-entry v-for="(value, key) in event" v-bind:key="key" v-bind:entry-key="key" v-bind:entry-value="value" /-->
<app-layout :rounded="rounded" :height="height">
  <template v-slot:navigation>
    <v-divider />
    <v-expansion-panels accordion>

      <v-expansion-panel class="transparent" style="">
        <v-expansion-panel-header class="pl-0">
          <v-list dense class="pa-0 ma-0" style="width: 100%;position: fixed;top: 0px;">
            <v-list-item class=" mycolor">
              <v-list-item-avatar>
                <v-icon>mdi-calendar-account-outline</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ currentCalendar.summary }}</v-list-item-title>
                <v-list-item-subtitle>{{ currentCalendar.description  }}</v-list-item-subtitle>

              </v-list-item-content>
              <v-menu top :offset-x="true">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn class="mr-13 rounded-lg" color="primary" dark v-bind="attrs" v-on="on">
                    Add
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item>
                    <v-list-item-title>Event</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Task</v-list-item-title>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Meeting</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item>
          </v-list>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-map-clock-outline</v-icon>
              </v-list-item-icon>

              <v-list-item-content>

                <v-list-item-title>Time-Zone : {{ currentCalendar.timeZone }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-divider></v-divider>
    <v-list-item class="px-0">
      <v-list-item-content class="pa-0 ma-0">
        <picker-calendar :focus="focus" :events="events" :calendar="currentCalendar" @click-day="pickerClickDay" @click-month="pickerClickMonth" @click-change="pickerClickMonth"></picker-calendar>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>
    <v-expansion-panels accordion>
      <v-expansion-panel class="transparent">
        <v-expansion-panel-header>
          <v-list dense class="pa-0 ma-0">
            <v-icon>mdi-calendar-clock</v-icon>
            Events
          </v-list>
          <v-badge inline color="green" :content="events.length || '0'">
          </v-badge>
        </v-expansion-panel-header>

        <v-divider />
        <v-expansion-panel-content>
          <v-list dense class="pa-0 ma-0">
            <v-list-item v-for="
              item in events" :key="item.title" link>
              <v-list-item-icon>
                <v-icon>mdi-calendar-clock-outline</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel class="transparent">
        <v-expansion-panel-header>
          <v-list dense class="pa-0 ma-0">
            <v-icon>mdi-calendar-edit</v-icon>
            Tasks
          </v-list>
          <v-badge inline color="green" content="0">
          </v-badge>
        </v-expansion-panel-header>
        <v-divider />
        <v-expansion-panel-content>

        </v-expansion-panel-content>
      </v-expansion-panel>

      <v-expansion-panel class="transparent">
        <v-expansion-panel-header>
          <v-list dense class="pa-0 ma-0">
            <v-icon>mdi-video-outline</v-icon>
            Meetings
          </v-list>
          <v-badge inline color="green" content="0">
          </v-badge>
        </v-expansion-panel-header>
        <v-divider />
        <v-expansion-panel-content>

        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-divider></v-divider>
  </template>

  <template v-slot:toolbar>
    <v-icon>mdi-calendar-account-outline</v-icon>
    <v-toolbar-title class="px-3" @click="redirectId('Calendar',id)">{{ currentCalendar.summary }}</v-toolbar-title>
  </template>

  <v-sheet height="48" style="">
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


  <v-sheet class='appHeight' ref="calendarContainer" :style="contentStyle">

    <v-calendar ref="calendar" v-model="focus" :locale="locale" color="primary" :type="mytype" :events="events" :event-color="getEventColor" :event-ripple="false" @change="calendarChange" @mousedown:event="startDrag" @click:event="showEvent"
      @mousedown:time="startTime" @mousemove:time="mouseMove" @mouseup:time="endDrag" @mouseleave.native="cancelDrag" @click:more="viewDay" @click:date="viewDay">

      <template v-slot:event="{ event, timed, eventSummary }">
        <div class="v-event-draggable" v-html="eventSummary()">
        </div>

        <div v-if="timed" class="v-event-drag-bottom" @mousedown.stop="extendBottom(event)"></div>
      </template>

      <template v-slot:day-body="{ date, week }">
        <div class="v-current-time" :class="{ first: date === week[0].date }" :style="{ top: nowY }"></div>
      </template>
    </v-calendar>

    <v-menu v-model="selectedOpen" :activator="selectedElement" offset-x :close-on-content-click="false">
      <event-item min-width="500px" min-height="350px" max-height="50%" :calendar="cal" :calendar-info="currentCalendar" :event="currentEvent" @cancel="cancelFormEvent" @valid="validFormEvent" @remove="removeEvent" @fullscreen="showFullscreenEvent"></event-item>
    </v-menu>

  </v-sheet>


  <!--v-row class="pa-0 ma-0">

    <v-col v-if="fullEvent" cols="8" class="ma-0 pa-0">
      <event-item v-if="fullEvent" :calendar="cal" :calendar-info="currentCalendar" :event="currentEvent" @cancel="cancelFormEvent" @valid="validFormEvent" @fullscreen="showFullscreenEvent" @remove="removeEvent"></event-item>
    </v-col>
    <v-col :cols="cols" class="ma-0 pa-0">

      <v-sheet height="64" class="rounded-t-lg">
        <v-toolbar dark flat style="top:Opx" class="rounded-t-lg mycolor">
          <v-icon>mdi-calendar-account-outline</v-icon>
          <v-toolbar-title class="px-5">{{ currentCalendar.summary }}</v-toolbar-title>
          <v-toolbar-title class="px-5">{{ currentCalendar.description  }}</v-toolbar-title>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="48" style="margin-left:256px">
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

      <v-navigation-drawer dark class="mycolor" v-model="drawer" floating absolute style="margin-top:48px">
        <v-list>
          <v-list-item class="px-2">
            <bar-avatar>
              {{ currentCalendar.summary }}
            </bar-avatar>
            {{ currentCalendar.summary }}
            <v-btn icon @click.stop="drawer = !drawer">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
      </v-navigation-drawer>

      <v-sheet ref="calendarContainer" :height="maxHeight" style="margin-left:256px">

        <v-calendar ref="calendar" v-model="focus" :locale="locale" color="primary" :type="mytype" :events="events" :event-color="getEventColor" :event-ripple="false" @change="calendarChange" @mousedown:event="startDrag" @click:event="showEvent"
          @mousedown:time="startTime" @mousemove:time="mouseMove" @mouseup:time="endDrag" @mouseleave.native="cancelDrag" @click:more="viewDay" @click:date="viewDay">

          <template v-slot:event="{ event, timed, eventSummary }">
            <div class="v-event-draggable" v-html="eventSummary()">
            </div>

            <div v-if="timed" class="v-event-drag-bottom" @mousedown.stop="extendBottom(event)"></div>
          </template>

          <template v-slot:day-body="{ date, week }">
            <div class="v-current-time" :class="{ first: date === week[0].date }" :style="{ top: nowY }"></div>
          </template>
        </v-calendar>

      </v-sheet>
      <v-menu v-model="selectedOpen" :activator="selectedElement" offset-x :close-on-content-click="false">
        <event-item min-width="500px" min-height="350px" max-height="50%" :calendar="cal" :calendar-info="currentCalendar" :event="currentEvent" @cancel="cancelFormEvent" @valid="validFormEvent" @remove="removeEvent" @fullscreen="showFullscreenEvent"></event-item>
      </v-menu>
    </v-col>
  </v-row-->
  <!--/v-container-->
</app-layout>
</template>

<script>
//import Vue from 'vue'
import {
  tz
} from "moment-timezone";
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
import EventItem from '@bundles/calendar-bundle/Resources/vue/components/Event';
import nodefony from 'nodefony-client';
import AppLayout from '@/components/layouts/AppLayout.vue';

import PickerCalendar from '@bundles/calendar-bundle/Resources/vue/components/PickerCalendar.vue';
export default {
  name: "calendar",
  components: {
    "event-item": EventItem,
    "app-layout": AppLayout,
    "picker-calendar": PickerCalendar
  },
  props: {
    id: null,
    type: {
      type: String,
      default: "week"
    },
    height: {
      type: String,
      //default: "100%"
    },
    readonly: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "#1a242d"
    },
    rounded: {
      type: [Boolean, String],
      default: false
    }
  },
  data: () => ({
    mini: true,
    drawer: true,
    fullEvent: false,
    cols: 12,
    ready: false,
    focus: '', //new Date(),
    oldFocus: null,
    overlay: false,
    myreadonly: false,
    showFullscreenEventState: false,
    now: null,
    mytype: "week",
    oldType: null,
    typeToLabel: {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      '4day': '4 Days',
    },
    colors: ['#2196F3', '#3F51B5', '#673AB7', '#00BCD4', '#4CAF50', '#FF9800', '#757575'],
    addEvent: false,
    openEvent: false,
    dragEvent: null,
    dragStart: null,
    startDraging: false,
    createEvent: null,
    createStart: null,
    extendOriginal: null,
    selectedEvent: null,
    selectedElement: null,
    selectedOpen: false,
    events: [],
    currentIndexEvent: null,
    currentCalendar: {},
    message: null
  }),
  watch: {
    mytype(val) {
      this.ready = true
    },
    message(value) {
      if (value) {
        this.notify(value)
      }
    }
  },

  async mounted() {
    this.ready = true;
    this.myreadonly = this.readonly;
    this.now = this.$refs.calendar.times.now
    this.scrollToTime()
    this.updateTime()
    if (this.isAuthenticated) {
      await this.getCalendar(this.id)
      this.mytype = this.type;
      this.$refs.calendar.checkChange()
      window.addEventListener("keyup", this.onEscapeKeyUp);
    }
    return await this.closeDrawer();
  },

  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getLocale'
    ]),
    contentStyle() {
      if (this.height) {
        return {
          height: this.height - 48
        }
      }
      return {}
    },
    locale() {
      return this.$root.$i18n.locale;
    },
    cal() {
      return this.ready ? this.$refs.calendar : null
    },
    currentEvent() {
      //console.log("currentEvent", `dragEvent: ${this.dragEvent}  / selectedEvent: ${this.selectedEvent} / createEvent: ${this.createEvent}`);
      if (this.dragEvent) {
        return this.dragEvent.event
      }
      if (this.createEvent) {
        return this.createEvent.event
      }
      if (this.selectedEvent) {
        return this.selectedEvent.event
      }
      return null
    },
    nowY() {
      return this.cal ? this.cal.timeToY(this.now) + 'px' : '-10px'
    },
    myTimeZone() {
      let code = tz.zonesForCountry(this.getLocale[3])
      return {
        zone: code[1],
        utc: tz(code[1]).format('(zZ)')
      }
    },
    timezone() {
      return {
        zone: this.currentCalendar.timeZone,
        utc: tz(this.currentCalendar.timeZone).format('(zZ)')
      }
    }
  },

  methods: {
    ...mapMutations([
      'closeDrawer'
    ]),
    ...mapActions([
      'getRemoteCalendar',
      'getRemoteEvents',
      'addRemoteEvent',
      'removeRemoteEvent',
      'updateRemoteEvent',
      'patchRemoteEvent'
    ]),
    onEscapeKeyUp(event) {
      if (event.which === 27) {
        if (this.addEvent) {
          this.addEvent = false;
          this.openEvent = false
          return this.cancelDrag()
        }
      }
    },
    redirectId(route, id) {
      return this.$router.push({
          name: route,
          params: {
            id: id
          }
        })
        .catch(() => {})
    },
    async getCalendar(id) {
      return await this.getRemoteCalendar({
          id
        })
        .then((result) => {
          this.currentCalendar = result;
          return result
        })
        .catch(e => {
          this.message = this.log(e.message, "ERROR")
          throw e;
        })
    },
    async calendarChange({
        start,
        end
      },
      id = this.id) {
      this.overlay = true;
      return this.getRemoteEvents({
          id,
          start,
          end,
          hasTime: false,
          type: this.mytype
        })
        .then(async (result) => {
          this.events = [];
          result.map((item) => {
            this.addEventCalendar(item)
          })
          this.cal.checkChange()
          this.overlay = false;
          this.scrollToTime()
          return result
        })
        .catch(e => {
          this.message = this.log(e.message, "ERROR")
          this.overlay = false;
          throw e;
        })
    },

    async createRemoteEvent(event, id = this.id) {
      return this.addRemoteEvent({
          event,
          id
        })
        .then(async (result) => {
          return this.addEventCalendar(result, this.currentIndexEvent)
        })
        .catch((e) => {
          this.message = this.log(e.message, "ERROR")
          this.cancelFormEvent()
          throw e;
        })
    },

    async removeEvent(event, id = this.id) {
      let options = {
        body: JSON.stringify({
          sendNotifications: false
        })
      }
      return await this.removeRemoteEvent({
          event,
          id,
          options
        })
        //return await this.$nodefony.request(url, "DELETE", options)
        .then(async (result) => {
          return this.removeEventCalendar(result)
        })
        .catch((e) => {
          this.message = this.log(e.message, "ERROR")
          this.cancelFormEvent()
          throw e;
        })
    },

    async updateEvent(event, id = this.id) {
      let options = {
        body: JSON.stringify({
          sendNotifications: false
        })
      }
      return await this.updateRemoteEvent({
          event,
          id,
          options
        })
        .then(async (result) => {
          return this.updateEventCalendar(result)
        })
        .catch((e) => {
          this.message = this.log(e.message, "ERROR")
          this.cancelFormEvent()
          throw e;
        })
    },
    async patchEvent(event, id = this.id) {
      let options = {
        body: JSON.stringify({
          sendNotifications: false
        })
      }
      return this.patchRemoteEvent({
          event,
          id,
          options
        })
        .then(async (result) => {
          return this.updateEventCalendar(result)
        })
        .catch((e) => {
          this.message = this.log(e.message, "ERROR")
          this.cancelFormEvent()
          throw e;
        })
    },

    addEventCalendar(item, index) {
      let mystart = new Date(item.start)
      let myend = new Date(item.end)
      //let timestampS = mystart.getDate();
      //let timestampE = myend.getDate();
      const timed = mystart.getDate() === myend.getDate();
      if (index || index === 0) {
        this.events.splice(index, 1)
      }
      return this.events.push({
        name: item.summary,
        start: mystart.getTime(),
        end: myend.getTime(),
        color: item.colorId || 'primary',
        timed: timed,
        event: item
      })
    },

    removeEventCalendar(item) {
      let index = this.getIndexEvent(item)
      if (index) {
        return this.cancelFormEvent(index)
      }
    },

    updateEventCalendar() {

    },


    getIndexEvent(item) {
      return this.events.findIndex((ele, index) => {
        if (ele.event.id === item.id) {
          return index
        }
      })
    },

    getCurrentTime() {
      return this.$refs.calendar ? this.$refs.calendar.times.now.hour * 60 + this.$refs.calendar.times.now.minute : 0
    },
    scrollToTime() {
      const time = this.getCurrentTime()
      const first = Math.max(0, time - (time % 30) - 30)
      this.$refs.calendar.scrollToTime(first)
    },
    updateTime() {
      setInterval(() => this.cal.updateTimes(), 60 * 1000)
    },
    viewDay({
      date
    }) {
      if (this.showFullscreenEventState) {
        return
      }
      if (date) {
        this.focus = date
      }
      this.mytype = 'day'
    },

    setToday() {
      this.focus = ''
    },
    setFocus(date) {
      this.focus = date
    },
    prev() {
      this.$refs.calendar.prev()
    },
    next() {
      this.$refs.calendar.next()
    },
    pickerClickDay(date) {
      this.focus = date;
      this.mytype = 'day'
    },
    pickerClickMonth(date, change = true) {
      this.focus = `${date}-01`;
      if (change) {
        this.mytype = 'month'
      }
    },

    /*showEvent({
      nativeEvent,
      event
    }) {
      this.log(`SHOW EVENT`, "WARNING")
      this.selectedEvent = null
      if (this.showFullscreenEventState) {
        nativeEvent.stopPropagation()
        return
      }
      //this.openEvent = false
      const open = () => {
        this.log(`OPEN EVENT openEvent : ${this.openEvent}    Event timed : ${event.timed}`, "WARNING")
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() => requestAnimationFrame(() => {
          this.openEvent = false
        }))
      }
      if (this.openEvent) {
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        console.log("no click")
        if (!event.timed) {
          return requestAnimationFrame(() => requestAnimationFrame(() => open()))
        }
        this.cleanDragDrop();
        //open()
      }
      nativeEvent.stopPropagation()
    },*/

    showEvent({
      nativeEvent,
      event
    }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }
      nativeEvent.stopPropagation()
    },

    /*startDrag({
      event,
      timed
    }) {
      if (this.myreadonly) {
        return;
      }
      this.log(`START DRAG event :${!!event} timed : ${timed}`, "WARNING")
      if (event ) {
        this.dragEvent = event
        this.dragTime = null
        this.extendOriginal = null
      }
    },*/
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


    /*
    startTime(tms) {
      this.log(`START TIME : `, "WARNING");
      if (this.myreadonly) {
        return;
      }
      if (this.openEvent) {
        this.openEvent = false;
        return this.cancelDrag();
      }
      this.openEvent = true
      this.selectedElement = tms.nativeEvent.target;
      const mouse = this.toTime(tms)
      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start
        this.dragTime = mouse - start
      } else {
        this.createStart = this.roundTime(mouse)
        const roundTo = 60 // minutes
        const roundDownTime = roundTo * 60 * 1000
        this.createEnd = this.createStart + roundDownTime
        this.createEvent = {
          name: `New Event`,
          color: this.rndElement(this.colors),
          start: this.createStart,
          end: this.createEnd,
          timed: true,
        }
        this.createEvent.event = this.createDefaultEvent(this.createEvent)
        const index = this.events.push(this.createEvent)
        this.currentIndexEvent = index - 1;
      }
    },*/
    createDefaultEvent(event) {
      return {
        summary: event.name,
        start: event.start,
        end: event.end,
        colorId: event.color
      }
    },
    startTime(tms) {
      const mouse = this.toTime(tms)

      if (this.dragEvent && this.dragTime === null) {
        const start = this.dragEvent.start
        this.dragTime = mouse - start
      } else {
        this.createStart = this.roundTime(mouse)
        this.createEvent = {
          name: `Event #${this.events.length}`,
          color: this.rndElement(this.colors),
          start: this.createStart,
          end: this.createStart,
          timed: true,
        }
        this.createEvent.event = this.createDefaultEvent(this.createEvent)
        this.events.push(this.createEvent)
      }
    },

    /*mouseMove(tms) {
      if (this.myreadonly) {
        return;
      }
      this.log(`Mouse Move : dragEvent`);
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
        this.dragEvent.event.start = newStart
        this.dragEvent.event.end = newEnd
        this.end = new Date(this.dragEvent.end)
        this.log(`Mouse Move : dragEvent`, "DEBUG");
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false)
        const min = Math.min(mouseRounded, this.createStart)
        const max = Math.max(mouseRounded, this.createStart)
        this.createEvent.start = min
        this.createEvent.end = max
        this.createEvent.event.start = min
        this.createEvent.event.end = max
        this.log(`Mouse Move createEvent start : ${min} end : ${max}`, "DEBUG");
      }
    },*/
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
      } else if (this.createEvent && this.createStart !== null) {
        const mouseRounded = this.roundTime(mouse, false)
        const min = Math.min(mouseRounded, this.createStart)
        const max = Math.max(mouseRounded, this.createStart)

        this.createEvent.start = min
        this.createEvent.end = max
      }
    },

    /*async endDrag(tms) {
      if (this.myreadonly) {
        return;
      }
      this.log(`ENDDRAG open : ${this.openEvent} dargEvent :  ${!!this.dragEvent} extendOriginal : ${!!this.extendOriginal}`, "WARNING");

      if (this.dragEvent) {
        // drag
        if (this.openEvent) {
          console.log("Pass openEvent")
          if (this.addEvent) {
            this.cleanDragDrop();
          } else {
            //drag
            this.openEvent = false
            this.log("DRAGGING", "WARNING")
            return await this.patchEvent(this.currentEvent)
              .then(() => {
                return this.cleanDragDrop();
              });
          }
        } else {
          if (this.extendOriginal) {
            console.log("Pass extendOriginal")
            return await this.patchEvent(this.currentEvent)
              .then(() => {
                return this.cleanDragDrop();
              });
          } else {
            console.log("Do NOTHING")
            //this.cleanDragDrop();
          }
        }
      }
      if (this.createEvent) {
        setTimeout(() => {
          console.log("passs one shoot")
          this.addEvent = true;
        }, 200)
      }
    },*/
    endDrag() {
      this.dragTime = null
      this.dragEvent = null
      this.createEvent = null
      this.createStart = null
      this.extendOriginal = null
    },

    /*extendBottom(event) {
      this.log(`CLICK extendBottom start : ${event.start}  end : ${event.end}`)
      if (this.myreadonly) {
        return;
      }
      this.createEvent = event
      this.createStart = event.start
      this.extendOriginal = event.end
    },

    cleanDragDrop() {
      this.log("CLEAN DRAG DROP", "WARNING")
      //this.openEvent = false
      this.currentIndexEvent = null;
      this.addEvent = false
      this.dragTime = null
      this.dragEvent = null
      this.createEvent = null
      this.createStart = null
      this.extendOriginal = null
    },

    cancelDrag(mouseEvent) {
      this.log("CANCEL DRAG", "WARNING")
      if (this.myreadonly) {
        return;
      }
      if (this.createEvent) {
        if (this.extendOriginal && !this.addEvent) {
          console.log("extend")
          this.createEvent.end = this.extendOriginal
        } else {
          if (!mouseEvent) {
            if (this.currentIndexEvent !== null) {
              this.events.splice(this.currentIndexEvent, 1)
            }
            this.createEvent = null
          }
        }
        return
      }
      if (this.selectedEvent) {
        return;
      }
      this.cleanDragDrop()
    },
    */

    extendBottom(event) {
      this.createEvent = event
      this.createStart = event.start
      this.extendOriginal = event.end
    },


    cancelDrag() {
      if (this.createEvent) {
        if (this.extendOriginal) {
          this.createEvent.end = this.extendOriginal
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

    cancelFormEvent(index) {
      if (this.fullEvent) {
        this.fullEvent = false
        this.cols = 12
      }
      if (index || index === 0) {
        this.events.splice(index, 1)
      }
      if (this.currentIndexEvent !== null) {
        this.events.splice(this.currentIndexEvent, 1)
      }
      //this.cleanDragDrop()
    },

    async validFormEvent(event) {
      if (this.createEvent) {
        return await this.createRemoteEvent(this.createEvent)
          .then(() => {
            //this.cleanDragDrop();
          })
          .catch(() => {
            this.cancelFormEvent()
          })
      }
      return this.updateEvent(event)
        .then(() => {
          //this.cleanDragDrop();
        })
        .catch(() => {
          //this.cancelFormEvent()
        })
    },

    showFullscreenEvent(active, event, element) {
      this.fullEvent = true;
      this.cols = 4
      this.addEvent = false
      return;
      this.myreadonly = active
      this.showFullscreenEventState = active
      if (active) {
        this.oldType = this.mytype;
        //this.oldFocus = this.focus
        element.append(this.cal.$el)
        //this.focus = event.start
        this.mytype = "day"
      } else {
        const container = this.$refs.calendarContainer
        container.$el.append(element)
        this.myreadonly = this.readonly
        if (this.oldType) {
          this.mytype = this.oldType;
        }
        this.oldType = null;
        if (this.oldFocus) {
          this.focus = this.oldFocus;
        }
        this.oldFocus = null;
      }
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
.appHeight {
    height: calc(100% - 48px);
}
.v-current-time {
    height: 2px;
    background-color: #ea4335;
    position: absolute;
    left: -1px;
    right: 0;
    pointer-events: none;

    &.first::before {
        content: '';
        position: absolute;
        background-color: #ea4335;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-top: -5px;
        margin-left: -6.5px;
    }
}
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
