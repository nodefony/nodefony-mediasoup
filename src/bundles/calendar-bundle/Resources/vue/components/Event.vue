<template>
<v-dialog v-model="show" persistent fullscreen transition="dialog-bottom-transition" hide-overlay>
  <!--v-form ref="form" v-model="valid" lazy-validation-->
  <v-card tile height="100%">
    <v-toolbar outlined elevation="1" :color="color">
      <v-btn icon dark @click="cancelFormEvent">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="indigo" @click="validFormEvent">
        Save
      </v-btn>
      <v-btn color="deep-purple" outlined @click="cancelFormEvent">
        Close
      </v-btn>
    </v-toolbar>
    <!--v-toolbar flat outlined elevation="0" class="d-flex flex-row mb-6">
        <v-select dense v-model="calendar.timezone" :hint="`${timezone.zone}, ${timezone.utc}`" :items="timezoneList" item-text="zone" item-value="utc" label="" persistent-hint return-object single-line></v-select>
      </v-toolbar-->

    <v-card-text>
      <!--v-row>
            <v-col cols="4">
              <v-subheader>Suffix for time zone</v-subheader>
            </v-col>
            <v-col cols="8">
              <v-text-field label="Label Text" value="12:30:00" type="time" suffix="PST"></v-text-field>
            </v-col>
          </v-row-->
      <v-row>
        <v-col cols="1" class="text-center">
          <v-subheader>Title</v-subheader>
        </v-col>
        <v-col cols="11">
          <v-text-field prepend-icon="mdi-pencil-outline" label="Title" :value="name" single-line full-width></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="1">
          <v-subheader>DATE</v-subheader>
        </v-col>
        <v-col cols="11" class="d-flex flex-row mb-6">
          <!--START DATE-->
          <v-menu ref="menuStartDate" v-model="menuStartDate" :close-on-content-click="false" :return-value.sync="isoStartDate" transition="scale-transition" offset-y min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="isoStartDate" label="Date Start" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-if="menuStartDate" v-model="isoStartDate" :locale="locale" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menuStartDate = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.menuStartDate.save(start)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>

          <!--START TIME-->
          <v-menu ref="menuStart" v-model="menuStart" :close-on-content-click="false" :nudge-right="40" :return-value.sync="isoStartTime" transition="scale-transition" offset-y max-width="290px" min-width="290px">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="isoStartTime" label="Time start" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-time-picker v-if="menuStart" v-model="isoStartTime" full-width @click:minute="$refs.menuStart.save(isoStartTime)" format="24hr"></v-time-picker>
          </v-menu>

          <!--END DATE-->
          <v-menu ref="menuEndDate" v-model="menuEndDate" :close-on-content-click="false" :return-value.sync="isoEndDate" transition="scale-transition" offset-y min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="isoEndDate" label="Date End" prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-if="menuEndDate" v-model="isoEndDate" :locale="locale" no-title scrollable>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="menuEndDate = false">
                Cancel
              </v-btn>
              <v-btn text color="primary" @click="$refs.menuEndDate.save(end)">
                OK
              </v-btn>
            </v-date-picker>
          </v-menu>
          <!--END TIME-->
          <v-menu ref="menuEnd" v-model="menuEnd" :close-on-content-click="false" :nudge-right="40" :return-value.sync="isoEndTime" transition="scale-transition" offset-y max-width="290px" min-width="290px">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="isoEndTime" label="Time end" prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-time-picker v-if="menuEnd" v-model="isoEndTime" full-width @click:minute="$refs.menuEnd.save(isoEndTime)" format="24hr"></v-time-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="1">
          <v-subheader>Description</v-subheader>
        </v-col>
        <v-col cols="11">
          <v-textarea v-model="description" color="teal">
            <template v-slot:label>
              <div>
                Description <small>(optional)</small>
              </div>
            </template>
          </v-textarea>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" text @click="validFormEvent">
        I accept
      </v-btn>
      <v-btn color="primary" text @click="cancelFormEvent">
        Cancel
      </v-btn>
    </v-card-actions>
  </v-card>
  <!--/v-form-->
</v-dialog>
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


export default {
  name: "event",
  data: () => ({
    color: "primary",
    show: "true",
    valid: true,
    name: "",
    start: new Date(),
    end: new Date(),
    menuEnd: false,
    menuStart: false,
    menuStartDate: false,
    menuEndDate: false,
    summary: ``,
    description: "",
    formData: {
      start: null,
      end: null
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
    selectedEvent: {
      type: Object,
      default: null
    }
  },
  mounted() {
    //console.log(this.event, this.calendar)
    console.log("mounted", this.event, this.selectedEvent)
    const event = this.event || this.selectedEvent
    this.start = new Date(event.start)
    this.end = new Date(event.end)
    this.name = event.name;
    this.color = event.color
  },
  computed: {
    locale() {
      return this.$root.$i18n.locale;
    },
    isoStartTime: {
      get() {
        let date = new Date(this.start)
        return `${date.getHours()}:${date.getMinutes()}`;
      },
      set(ele) {
        console.log(ele)
        let res = reg.exec(ele)
        if (res) {
          console.log(res)
          this.start.setHours(res[1]);
          this.start.setMinutes(res[2]);
          return ele //`${this.start.getHours()}:${this.start.getMinutes()}`;
        } else {
          let date = new Date(ele)
          console.log(date)
          return ele //`${date.getHours()}:${date.getMinutes()}`;
        }

      }
    },
    isoEndTime: {
      get() {
        let date = new Date(this.end)
        return `${date.getHours()}:${date.getMinutes()}`;
      },
      set(ele) {
        console.log(ele)
        let res = reg.exec(ele)
        if (res) {
          console.log(res)
          this.end.setHours(res[1]);
          this.end.setMinutes(res[2]);
          return ele //`${this.end.getHours()}:${this.end.getMinutes()}`;
        } else {
          let date = new Date(ele)
          console.log(date)
          return ele //`${date.getHours()}:${date.getMinutes()}`;
        }
      }
    },

    isoStartDate: {
      get() {
        let date = new Date(this.start)
        return date.toISOString().substr(0, 10)
      },
      set(ele) {
        this.start = new Date(ele)
        return this.start.toISOString().substr(0, 10);;
      }

    },
    isoEndDate: {
      get() {
        const date = new Date(this.end)
        return date.toISOString().substr(0, 10)
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
    validFormEvent() {
      let res = this.$refs.form.validate()
      if (res) {
        this.$emit('valid')
      }
      return;
    },
    cancelFormEvent() {
      this.$emit('cancel')
    },
  }
}
</script>

<style scoped lang="scss">
</style>
