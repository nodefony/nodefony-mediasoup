<template>
<!--v-dialog v-model="show" persistent :max-width="!fullscreen?'600px':null" :fullscreen="fullscreen"-->
<v-card v-if="event" rounded="lg" v-bind="{...$props, ...$attrs}">
  <v-system-bar v-if="!systemBar" height="35px" dark class="mycolor">


    <v-icon @click="moveCalendar" class="ml-2">mdi-calendar-plus</v-icon>
    <v-subheader>@{{calendarInfo.summary}}</v-subheader>
    <v-spacer></v-spacer>
    <div v-if="!edit">
      <v-icon @click="removeEvent" color="red" class="ml-5">mdi-delete</v-icon>
      <v-icon @click="moveCalendar" color="blue" class="ml-5">mdi-pencil</v-icon>
      <v-icon @click="" color="green" class="ml-5">mdi-dots-vertical</v-icon>
    </div>
    <v-icon @click="cancelFormEvent" class="ml-10">mdi-close</v-icon>
  </v-system-bar>

  <v-toolbar height="48px" dark :color="color" flat>
    <v-toolbar-title>{{formData.summary}}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-card-text>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-text-field :readonly="!edit" v-model="formData.summary" dense prepend-icon="mdi-map-marker">
            <template v-slot:label>
              <div>
                Event Name
              </div>
            </template>
          </v-text-field>

          <v-row>
            <v-col cols="4" sm="4">
              <v-checkbox @change="allDayCheckAction" prepend-icon="mdi-map-marker" :readonly="!edit" v-model="dayAll" hide-details class="">
                <template v-slot:label>
                  <div>
                    All day
                  </div>
                </template>
              </v-checkbox>
            </v-col>

            <v-col cols="8" sm="8">
              <v-menu v-if="dayAll" offset-x v-model="menuAllDay" :close-on-content-click="true" max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field :readonly="!edit" dense :value="startFormat" readonly v-bind="attrs" v-on="on" class="mt-5">
                    <template v-slot:label>
                      <div>
                        All day
                      </div>
                    </template>
                  </v-text-field>
                </template>
                <v-date-picker @change="allDayAction" no-title :locale="locale" v-model="isoStart"></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <v-row v-if="!dayAll">
            <v-col cols="12" sm="6" class="pl-13">
              <v-menu offset-x v-model="menuStart" :close-on-content-click="true" max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field :readonly="!edit" dense :value="startFormat" label="Start Event Date" readonly v-bind="attrs" v-on="on"></v-text-field>
                </template>
                <v-date-picker no-title :locale="locale" v-model="isoStart"></v-date-picker>
              </v-menu>

            </v-col>
            <v-col cols="12" sm="6">
              <v-select @change="startTimeChange" :readonly="!edit" v-model="timeStart" dense :items="hours" label="Start Event Time" menu-props="auto"></v-select>
            </v-col>
          </v-row>
          <v-row v-if="!dayAll">
            <v-col cols="12" sm="6" class="pl-13">
              <v-menu offset-x v-model="menuEnd" :close-on-content-click="true" max-width="290">
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field :readonly="!edit" dense :value="endFormat" label="End Event Date" readonly v-bind="attrs" v-on="on"></v-text-field>
                </template>
                <v-date-picker offset-y no-title :locale="locale" v-model="isoEnd"></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select @change="endTimeChange" :readonly="!edit" v-model="timeEnd" dense :items="hours" label="End Event Time" menu-props="auto"></v-select>
            </v-col>
          </v-row>

          <v-textarea :readonly="!edit" dense v-model="formData.description" color="teal" prepend-icon="mdi-map-marker">
            <template v-slot:label>
              <div>
                Deccription <small>(optional)</small>
              </div>
            </template>
          </v-textarea>
        </v-col>
      </v-row>

    </v-container>

  </v-card-text>
  <v-card-actions v-if="edit">
    <v-spacer></v-spacer>
    <v-btn color="blue darken-1" text @click="cancelFormEvent">
      Close
    </v-btn>
    <v-btn color="blue darken-1" text @click="validFormEvent">
      Save
    </v-btn>
  </v-card-actions>
</v-card>
</template>


<script>
import {
  tz
} from "moment-timezone";
import moment from 'moment'
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
const reg = /^(..?){1}:(..?){1}$/;
import Vue from 'vue'

export default {
  name: "event",
  components: {

  },
  data: () => ({
    fullscreen: false,
    show: "true",
    valid: true,
    menuEnd: false,
    menuStart: false,
    menuAllDay: false,
    menuStartDate: false,
    menuEndDate: false,
    formData: {},
    dayAll: null,
    end: null,
    start: null,
    timeStart: null,
    timeEnd: null,
    edit: false
  }),
  props: {
    event: {
      type: Object,
      default: null
    },
    calendar: {
      type: Object,
      default: null
    },
    calendarInfo: {
      type: Object,
      default: null
    },
    systemBar: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: true
    }
  },
  created() {
    this.$moment = moment;
    this.$moment.locale(this.locale);
  },
  mounted() {
    console.log(this.event)
    this.formData = this.event.event || {};
    this.dayAll = !this.event.timed
    this.start = this.$moment(this.event.start)
    this.end = this.$moment(this.event.end)
    this.timeStart = this.start.format("HH:mm")
    this.timeEnd = this.end.format("HH:mm")
    this.edit = !this.read
    //console.log("mounted", this.event, this.start, this.end)
  },
  watch: {
    event(ev) {
      console.log("change ", ev)
      //this.formData = ev
    }
  },
  computed: {
    hours() {
      const tab = []
      for (let i = 0; i < 24; i++) {
        if (i < 10) {
          tab.push(`0${i}:00`)
          tab.push(`0${i}:15`)
          tab.push(`0${i}:30`)
          tab.push(`0${i}:45`)
        } else {
          tab.push(`${i}:00`)
          tab.push(`${i}:15`)
          tab.push(`${i}:30`)
          tab.push(`${i}:45`)
        }
      }
      return tab
    },
    locale() {
      return this.$root.$i18n.locale;
    },
    description() {
      return this.formData.description
    },
    color() {
      return this.event.color || 'primary';
    },
    startFormat() {
      return this.event.start ? this.$moment(this.start).format('dddd DD MMMM YYYY') : ''
    },
    endFormat() {
      return this.event.end ? this.$moment(this.end).format('dddd DD MMMM YYYY') : ''
    },
    isoStart: {
      get() {
        return this.$moment(this.start).format("YYYY-MM-DD")
      },
      set(start) {
        start = this.$moment(start)
        let mm = this.start.format("mm")
        let hh = this.start.format("HH")
        this.start = start.hours(hh).minutes(mm)
        this.event.start = this.start.unix()
        this.formData.start = start.unix()
        this.checkTimed()
        return this.start
      }
    },
    isoEnd: {
      get() {
        return this.$moment(this.end).format("YYYY-MM-DD")
      },
      set(end) {
        end = this.$moment(end)
        let mm = this.end.format("mm")
        let hh = this.end.format("HH")
        this.end = end.hours(hh).minutes(mm)
        this.event.end = end.unix()
        this.formData.end = end.unix()
        this.checkTimed()
        return this.end
      }
    },

    timezoneList() {
      let ele = moment.tz.names();
      return ele.map((item) => {
        let utc = moment.tz(item).format('(zZ)')
        return {
          zone: item,
          utc: utc
        }
      })
    },
  },
  methods: {
    checkTimed() {
      console.log(`Same DATE : ${this.start.isSame(this.end)}`, `Same DAY :  ${this.start.date() === this.start.date()}`)
      const sameDate = this.start.isSame(this.end);
      if (sameDate) {
        this.event.timed = false
        this.dayAll = !this.event.timed
        return
      }
      const sameDay = this.start.date() === this.end.date()
      const sameHour = this.start.hour() === this.end.hour()
      const sameMinute = this.start.minute() === this.end.minute()
      if (sameDay) {
        if (sameHour && sameMinute) {
          this.event.timed = false
        } else {
          this.event.timed = true
        }
        this.dayAll = !this.event.timed
        return
      }
      this.event.timed = false;
      this.dayAll = !this.event.timed
    },
    startTimeChange(time) {
      let res = reg.exec(time)
      this.start = this.start.hours(res[1]).minutes(res[2])
      this.event.start = this.start.valueOf()
      this.checkTimed()
      return time
    },

    endTimeChange(time) {
      let res = reg.exec(time)
      this.end = this.end.hours(res[1]).minutes(res[2])
      this.event.end = this.end.valueOf()
      this.checkTimed()
      return time
    },
    allDayAction(date) {
      this.start = this.$moment(date)
      this.event.start = this.start.valueOf()
      this.end = this.$moment(date)
      this.event.end = this.end.valueOf()
      this.event.timed = false
    },
    allDayCheckAction(res) {
      if (res) {
        this.event.timed = false
      } else {
        this.event.timed = true
      }
    },
    scrollToTime(date) {
      this.calendar.scrollToTime(this.isoStartTime)
    },
    fullCalendar() {
      return this.moveCalendar(this.calendar)
    },
    moveCalendar() {
      //this.$emit("fullscreen");
      this.edit = !this.edit;
      return;
      if (!this.fullscreen) {
        this.fullscreen = !this.fullscreen;
        this.$nextTick(() => {
          this.calendarEle = this.calendar.$el;
          //console.log(this.calendar.$el, this.$refs)
          //this.$refs.calendar.$el.append(this.calendar.$el)
          this.scrollToTime(this.formData.start)
          this.$emit("fullscreen", this.fullscreen, this.formData, this.$refs.calendar.$el);
        })
      } else {
        //console.log(this.calendarEle)
        this.$emit("fullscreen", !this.fullscreen, this.formData, this.calendarEle);
        this.$nextTick(() => {
          this.fullscreen = !this.fullscreen;
        })
      }
    },
    validFormEvent() {
      /*let res = this.$refs.form.validate()
      if (res) {
        this.$emit('valid')
      }*/
      this.$emit('valid', this.formData)
      return;
    },
    cancelFormEvent() {
      if (this.fullscreen) {
        this.fullCalendar();
        this.calendarEle = null;
      }
      this.$emit('cancel')
    },
    removeEvent() {
      this.$emit('remove', this.event)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
