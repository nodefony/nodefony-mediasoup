<template>
<!--v-dialog v-model="show" persistent :max-width="!fullscreen?'600px':null" :fullscreen="fullscreen"-->
<v-card rounded="lg" v-bind="{...$props, ...$attrs}">
  <v-system-bar v-if="!systemBar" height="35px" dark class="mycolor">

    <v-icon @click="moveCalendar" class="ml-2">mdi-calendar-plus</v-icon>
    <v-subheader>@{{calendarInfo.summary}}</v-subheader>
    <v-spacer></v-spacer>
    <v-icon @click="removeEvent" color="red" class="ml-5">mdi-delete</v-icon>
    <v-icon @click="moveCalendar" color="blue" class="ml-5">mdi-pencil</v-icon>
    <v-icon @click="" color="green" class="ml-5">mdi-dots-vertical</v-icon>
    <v-icon @click="cancelFormEvent" class="ml-10">mdi-close</v-icon>
  </v-system-bar>
  <v-toolbar height="48px" dark :color="color" flat>
    <v-toolbar-title>{{formData.summary}}</v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-card-text>
    <v-container fluid>
      <v-row v-if="!fullscreen">
        <v-col cols="12">
          <v-text-field prepend-icon="mdi-pencil-outline" label="Add Title" :value="formData.summary" single-line full-width></v-text-field>
          <v-subheader>{{start}}</v-subheader>
          <v-subheader>{{isoStartDate}} {{isoStartTime}}</v-subheader>
          <v-subheader>{{end}}</v-subheader>
          <v-subheader>{{isoEndDate}} {{isoEndTime}}</v-subheader>
        </v-col>

      </v-row>

      <v-row v-else>
        <v-col cols="6">
          <v-text-field prepend-icon="mdi-pencil-outline" label="Add Title" :value="formData.summary" single-line full-width></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-sheet ref="calendar" height="79vh">

          </v-sheet>
        </v-col>
      </v-row>
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
    color: "primary",
    show: "true",
    valid: true,
    start: new Date(),
    end: new Date(),
    menuEnd: false,
    menuStart: false,
    menuStartDate: false,
    menuEndDate: false,
    description: "",
    formData: {
      name: ""
    }
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
    }

  },
  mounted() {
    //console.log(this.event, this.calendar)
    this.formData = this.event;
    this.start = new Date(this.event.start)
    this.end = new Date(this.event.end)
    this.color = this.event.colorId
    console.log("mounted", this.event, this.start, this.end)
  },
  computed: {

    locale() {
      return this.$root.$i18n.locale;
    },
    isoStartTime: {
      get() {
        //let date = new Date(this.start)
        return `${new Date(this.event.start).getHours()}:${new Date(this.event.start).getMinutes()}`;
      },
      set(ele) {
        let res = reg.exec(ele)
        if (res) {
          this.start.setHours(res[1]);
          this.start.setMinutes(res[2]);
          return ele //`${this.start.getHours()}:${this.start.getMinutes()}`;
        } else {
          let date = new Date(ele)
          return ele //`${date.getHours()}:${date.getMinutes()}`;
        }

      }
    },
    isoEndTime: {
      get() {
        //let date = new Date(this.end)
        return `${new Date(this.event.end).getHours()}:${new Date(this.event.end).getMinutes()}`;
      },
      set(ele) {
        let res = reg.exec(ele)
        if (res) {
          this.end.setHours(res[1]);
          this.end.setMinutes(res[2]);
          return ele //`${this.end.getHours()}:${this.end.getMinutes()}`;
        } else {
          let date = new Date(ele)
          return ele //`${date.getHours()}:${date.getMinutes()}`;
        }
      }
    },

    isoStartDate: {
      get() {
        //let date = new Date(this.start)
        return new Date(this.event.start).toISOString().substr(0, 10)
      },
      set(ele) {
        this.start = new Date(ele)
        return this.start.toISOString().substr(0, 10);;
      }

    },
    isoEndDate: {
      get() {
        //const date = new Date(this.end)
        return new Date(this.event.end).toISOString().substr(0, 10)
      },
      set(ele) {
        this.end = new Date(ele)
        return this.end.toISOString().substr(0, 10);
      }
    },
    timezoneList() {
      let ele = tz.names();
      return ele.map((item) => {
        let utc = tz(item).format('(zZ)')
        return {
          zone: item,
          utc: utc
        }
      })
    },
  },
  methods: {
    scrollToTime(date) {
      this.calendar.scrollToTime(this.isoStartTime)
    },
    fullCalendar() {
      return this.moveCalendar(this.calendar)
    },
    moveCalendar() {
      this.$emit("fullscreen");
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
