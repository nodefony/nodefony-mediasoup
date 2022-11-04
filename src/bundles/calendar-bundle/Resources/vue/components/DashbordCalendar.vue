<template>
<dashboard-item v-bind="{...$props, ...$attrs}" v-if="isAuthenticated" class="my-2">
  <calendar rounded="lg" height="400" color="purple darken-4" readonly type="month" v-if="calendar" ref="calendar" :id="calendar.id"></calendar>
</dashboard-item>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';
// @ is an alias to /src
import DashboardItem from "@/components/dashboard/DashboardItem";
import calendar from "@bundles/calendar-bundle/Resources/vue/views/Calendar";
export default {
  name: 'DashboardCalendar',
  components: {
    "dashboard-item": DashboardItem,
    "calendar": calendar
  },
  props: {},
  data: () => ({
    calendar: null
  }),

  async mounted() {
    //this.$refs.calendar.checkChange()
    await this.getCalendar()
    return await this.getAllUsers()
      .then((ele) => {
        ele.result.rows.forEach((item, i) => {
          //this.categories.push(item.username)
        });
      })
      .catch((e) => {
        console.log(e)
      });

  },
  updated() {
    //console.log("home updated")
  },
  computed: {
    ...mapGetters([
      'hasRole',
      'getProfileUsername',
      'isAuthenticated'
    ]),
  },
  methods: {
    ...mapActions([
      "getAllUsers"
    ]),
    async getCalendar() {
      return await this.$nodefony.request(`calendar`, "GET", {})
        .then((res) => {
          this.calendar = res.result;
          return calendar
        })
    }

  }
}
</script>

<style lang="scss">

</style>
