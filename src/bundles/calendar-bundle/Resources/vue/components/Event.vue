<template>
<!--v-dialog v-model="show" persistent :max-width="!fullscreen?'600px':null" :fullscreen="fullscreen"-->
<v-card v-if="event" rounded="lg" v-bind="{...$props, ...$attrs}">
  <v-system-bar v-if="!systemBar" height="35px" dark class="mycolor">
    <!--v-icon @click="moveCalendar" class="ml-2">mdi-calendar-plus</v-icon-->
    <v-subheader>@{{calendarInfo.summary}}</v-subheader>
    <v-spacer></v-spacer>
    <div v-if="!edit">
      <v-icon @click="removeEvent" color="red" class="ml-5">mdi-delete</v-icon>
      <!--v-icon @click="moveCalendar" color="blue" class="ml-5">mdi-pencil</v-icon-->
      <v-icon @click="" color="green" class="ml-5">mdi-dots-vertical</v-icon>
    </div>
    <v-icon @click="cancelFormEvent" class="ml-10">mdi-close</v-icon>
  </v-system-bar>

  <v-toolbar height="48px" dark :color="color" flat>
    <v-toolbar-title>{{formData.summary}}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-tabs v-model="tab" align-with-title background-color="">
    <v-tabs-slider color="cyan"></v-tabs-slider>
    <v-tab>
      Event
    </v-tab>
    <v-tab>
      Task
    </v-tab>
  </v-tabs>

  <v-card-text>
    <v-container fluid>

      <v-text-field v-model="formData.summary" dense @input="summaryChange">
        <template v-slot:label>
          <div>
            Name
          </div>
        </template>
      </v-text-field>
      <v-divider></v-divider>

      <v-tabs-items v-model="tab">
        <v-tab-item>

          <v-expansion-panels multiple accordion v-model="panel">
            <v-expansion-panel readonly>
              <v-expansion-panel-header hide-actions>
                <v-list-item>
                  <v-list-item-action>
                    <v-icon>mdi-clipboard-text-clock</v-icon>
                  </v-list-item-action>
                  <v-checkbox @change="allDayCheckAction" v-model="dayAll" hide-details class="ma-0">
                    <template v-slot:label>
                      <div>
                        All day
                      </div>
                    </template>
                  </v-checkbox>
                </v-list-item>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row>
                  <v-col cols="4" sm="4">
                    <!--v-checkbox @change="allDayCheckAction" v-model="dayAll" hide-details class="">
                      <template v-slot:label>
                        <div>
                          All day
                        </div>
                      </template>
                    </v-checkbox-->
                  </v-col>

                  <v-col cols="8" sm="8">
                    <v-menu v-if="dayAll" offset-x v-model="menuAllDayStart" :close-on-content-click="true" max-width="290">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field dense :value="startFormat" v-bind="attrs" v-on="on" class="mt-5">
                          <template v-slot:label>
                            <div>
                              Start Day
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker @change="allDayStartAction" no-title :locale="locale" v-model="isoStart"></v-date-picker>
                    </v-menu>

                    <v-menu v-if="dayAll" offset-x v-model="menuAllDayEnd" :close-on-content-click="true" max-width="290">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field dense :value="endFormat" v-bind="attrs" v-on="on" class="mt-5">
                          <template v-slot:label>
                            <div>
                              End Day
                            </div>
                          </template>
                        </v-text-field>
                      </template>
                      <v-date-picker @change="allDayEndAction" no-title :locale="locale" v-model="isoEnd"></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
                <v-row v-if="!dayAll">
                  <v-col cols="12" sm="6" class="pl-13">
                    <v-menu offset-x v-model="menuStart" :close-on-content-click="true" max-width="290">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field dense :value="startFormat" label="Start Event Date" v-bind="attrs" v-on="on"></v-text-field>
                      </template>
                      <v-date-picker no-title :locale="locale" v-model="isoStart"></v-date-picker>
                    </v-menu>

                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select @change="startTimeChange" v-model="timeStart" dense :items="hours" label="Start Event Time" menu-props="auto"></v-select>
                  </v-col>
                </v-row>
                <v-row v-if="!dayAll">
                  <v-col cols="12" sm="6" class="pl-13">
                    <v-menu offset-x v-model="menuEnd" :close-on-content-click="true" max-width="290">
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field dense :value="endFormat" label="End Event Date" v-bind="attrs" v-on="on"></v-text-field>
                      </template>
                      <v-date-picker offset-y no-title :locale="locale" v-model="isoEnd"></v-date-picker>
                    </v-menu>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select @change="endTimeChange" v-model="timeEnd" dense :items="hours" label="End Event Time" menu-props="auto"></v-select>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header>
                <v-list-item>
                  <v-list-item-action>
                    <v-icon>mdi-monitor</v-icon>
                  </v-list-item-action>
                  Meeting

                </v-list-item>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-checkbox v-model="meeting" @change="changeMeeting" hide-details class="ma-0">
                  <template v-slot:label>
                    <div>
                      Active
                    </div>
                  </template>
                </v-checkbox>
                <v-row v-if="meeting && !formData.conferenceData.locked">
                  <v-col cols="3">
                    <v-subheader>{{$t('rooms.access')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-switch v-model="formData.conferenceData.access" :false-value="`private`" :true-value="`public`" :label="formatAccessLabel(formData.conferenceData.access)"></v-switch>
                  </v-col>
                </v-row>
                <v-row v-if="meeting && !formData.conferenceData.locked">
                  <v-col cols=" 3">
                    <v-subheader>{{$t('rooms.waiting')}}</v-subheader>
                  </v-col>
                  <v-col cols="9">
                    <v-switch v-model="formData.conferenceData.waitingconnect"></v-switch>
                  </v-col>
                </v-row>


              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header disable-icon-rotate>
                <v-list-item>
                  <v-list-item-action>
                    <v-icon>mdi-text</v-icon>
                  </v-list-item-action>
                  Description
                </v-list-item>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-textarea dense v-model="formData.description" color="teal">
                  <template v-slot:label>
                    <div>
                      Description
                    </div>
                  </template>
                </v-textarea>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header disable-icon-rotate>
                <v-list-item>
                  <v-list-item-action>
                    <v-icon>mdi-map-marker</v-icon>
                  </v-list-item-action>
                  Location
                </v-list-item>

              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-text-field v-model="formData.location" dense>
                  <template v-slot:label>
                    <div>
                      Location
                    </div>
                  </template>
                </v-text-field>
              </v-expansion-panel-content>
            </v-expansion-panel>

          </v-expansion-panels>
        </v-tab-item>

        <v-tab-item>

        </v-tab-item>
      </v-tabs-items>

    </v-container>

  </v-card-text>
  <v-card-actions>
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
    tab: null,
    panel: [0],
    show: "true",
    valid: true,
    menuEnd: false,
    menuStart: false,
    menuAllDayStart: false,
    menuAllDayEnd: false,
    menuStartDate: false,
    menuEndDate: false,
    formData: {},
    meeting: false,
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
    this.formData = this.event.event || {};
    if (this.formData.conferenceData) {
      this.meeting = true
    }
    this.formData.start = this.event.start
    this.formData.end = this.event.end
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
        this.event.start = this.start.valueOf()
        this.formData.start = this.event.start
        //this.checkTimed()
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
        this.event.end = this.end.valueOf()
        this.formData.end = this.event.end
        //this.checkTimed()
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
    changeMeeting(status) {
      console.log(status)
      if (status) {
        this.formData.conferenceData = {
          locked: false
        }

      } else {
        this.formData.conferenceData = null
      }
    },
    formatAccessLabel(label) {
      return label == 'private' ? 'Private' : 'Public';
    },
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
      this.formData.start = this.event.start
      //this.checkTimed()
      return time
    },
    summaryChange(text) {
      this.event.name = text
    },
    endTimeChange(time) {
      let res = reg.exec(time)
      this.end = this.end.hours(res[1]).minutes(res[2])
      this.event.end = this.end.valueOf()
      this.formData.end = this.event.end
      //this.checkTimed()
      return time
    },
    allDayStartAction(date) {
      this.start = this.$moment(date)
      this.event.start = this.start.valueOf()
      this.event.timed = false
    },
    allDayEndAction(date) {
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
    validFormEvent() {
      /*let res = this.$refs.form.validate()
      if (res) {
        this.$emit('valid')
      }*/
      this.$emit('valid', this.formData, this.event.newEvent)
      return;
    },
    cancelFormEvent() {
      this.$emit('cancel')
    },
    removeEvent() {
      this.$emit('remove', this.event.event)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
