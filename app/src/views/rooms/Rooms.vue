<template>
<v-container fluid>
  <h1> Rooms</h1>

  <v-data-table :loading="loading" :headers="headers" :items="rooms" :items-per-page="5" class="elevation-2" @click:row="openRoom">
  </v-data-table>

</v-container>
</template>

<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'Rooms',
  components: {},
  props: {},
  data(vm) {
    return {
      loading: true,
      rooms: []
    }
  },
  mounted() {
    this.getRooms();
  },
  computed: {
    headers() {
      return [{
          text: this.$t("rooms.name"),
          align: 'start',
          sortable: false,
          value: 'name',
        },
        {
          text: this.$t("rooms.description"),
          value: 'description'
        },
        {
          text: this.$t("rooms.secure"),
          value: 'secure'
        },
        {
          text: 'image',
          value: 'image'
        }
      ]
    }
  },
  destroyed() {},
  beforeMount() {},
  methods: {
    async getRooms() {
      return this.$mediasoup.api.get("rooms")
        .then((data) => {
          this.rooms = data.result.rows
          this.loading = false;
        })
        .catch(e => {
          this.log(e, "ERROR");
          this.loading = false;
          throw e
        })
    },
    openRoom(item) {
      return this.$router.push({
        name: 'Room',
        params: {
          roomid: item.name
        }
      })
    }
  }

}
</script>
