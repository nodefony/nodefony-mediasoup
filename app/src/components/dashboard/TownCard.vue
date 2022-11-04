<template>
<v-card dark v-bind="{...$props, ...$attrs}" elevation="8" rounded="lg" class="mycolor">
  <bar-avatar elevation="8" large style="position:absolute"></bar-avatar>
  <v-card-title class="text-h6 pl-15">{{getProfileName}} {{getProfileSurname}}</v-card-title>
  <v-card-title class="text-h5">{{nowLocal}}</v-card-title>
  <v-card-subtitle class="">{{now}}</v-card-subtitle>
  <v-card-title class="text-h6">Browser</v-card-title>
  <v-card-subtitle>Time-Zone : {{browserInfo.dateFormat.timeZone}}</v-card-subtitle>

  <v-card-title v-if="loaded" class="text-h4">{{city}}</v-card-title>
  <v-card-subtitle v-if="loaded" class="">Latitude: {{latitude}} ° Longitude: {{longitude}} °</v-card-subtitle>

  <v-card-title class="text-h6">Position</v-card-title>
  <v-card-text class="cyan--text lighten-5 text-h5 font-weight-bold ">
    <v-row>
      <v-col cols="6">
        <v-list-item-subtitle>{{fullAdress[0]}} {{fullAdress[1]}}</v-list-item-subtitle>
        <v-list-item-subtitle>{{fullAdress[2]}} {{fullAdress[3]}}</v-list-item-subtitle>
        <v-list-item-subtitle>{{fullAdress[5]}} {{fullAdress[6]}}</v-list-item-subtitle>
      </v-col>
      <v-col cols="6">
        <v-list-item-subtitle>{{fullAdress[8]}}</v-list-item-subtitle>
        <v-list-item-subtitle>{{fullAdress[4]}} {{fullAdress[9]}}</v-list-item-subtitle>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="" max-height="300">
          <div class="rounded-lg" id="map" style="width:100%;height:300px;z-index:0">
          </div>
          <v-fade-transition>
            <v-overlay absolute :value="overlay" style="z-index:1000">
              <v-progress-circular indeterminate class=""></v-progress-circular>

            </v-overlay>
          </v-fade-transition>
        </v-card>
      </v-col>
    </v-row>
  </v-card-text>

  <slot></slot>
</v-card>
</template>
<script>
// @ is an alias to /src
import BarAvatar from '@/components/layouts/avatar.vue';
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';
const now = new Date()
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: '2-digit',
  minute: '2-digit',
  //second: '2-digit'
};
import {
  mapGetters
} from 'vuex';
export default {
  name: 'Town',
  components: {
    "bar-avatar": BarAvatar
  },
  data() {
    return {
      overlay: true,
      dateUtc: null,
      dateLocal: null,
      address: null,
      display_name: null,
      status: '',
      latLng: null,
      loaded: false,
      geolocationMap: null,
      popup: null,
      layer: "https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
    }
  },
  props: {

  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'getUser',
      'getProfile',
      'getTrigramme',
      'getInitials',
      'getProfileName',
      'getProfileSurname'
    ]),
    now: {
      get() {
        return this.dateUtc;
      },
      set(date) {
        this.dateUtc = date.toUTCString();
      }
    },
    nowLocal: {
      get() {
        return this.dateLocal;
      },
      set(date) {
        this.dateLocal = date.toLocaleDateString(undefined, options)
      }
    },
    latitude() {
      if (this.latLng) {
        return this.latLng.lat
      }
      return ""
    },
    longitude() {
      if (this.latLng) {
        return this.latLng.lng
      }
      return ""
    },
    city() {
      if (this.address) {
        return this.address.city
      }
      return ""
    },
    fullAdress() {
      if (this.address) {
        return this.display_name.split(",")
      }
      return []
    },
    browserInfo() {
      let res = Intl.DateTimeFormat().resolvedOptions()
      return {
        dateFormat: res
      }
    }
  },
  mounted() {
    if ("geolocation" in navigator) {
      this.status = 'Locating…';
      navigator.geolocation.getCurrentPosition(this.success, this.error);
      this.geolocationMap = L.map('map', {
        //center: this.latLng, //[40.731701, -73.993411],
        zoom: 20
      });
      L.tileLayer(this.layer, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.geolocationMap);
      /*L.tileLayer(this.layer, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="">osmfr</a>',
        maxZoom: 18,
        //id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        //accessToken: 'your.mapbox.access.token'
      }).addTo(this.geolocationMap);*/

    } else {
      this.log(`géolocalisation not enable`);
      /* la géolocalisation n'est pas disponible */
    }
    this.now = new Date()
    this.nowLocal = new Date()
    setInterval(() => {
      this.now = new Date()
      this.nowLocal = new Date()
    }, 60000)
  },
  methods: {
    async success(position) {
      this.latLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      await this.getTown()
      this.log(this.latLng)
      this.popup = L.popup();
      this.popup.setLatLng(this.latLng);
      this.popup.setContent('This is your current location');
      this.popup.openOn(this.geolocationMap);
      this.geolocationMap.setView(this.latLng);
      this.status = '';
      this.loaded = true
      this.overlay = false
    },
    error() {
      this.status = 'Unable to retrieve your location';
    },
    getTown() {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${this.latLng.lat}&lon=${this.latLng.lng}&format=json`
      return fetch(url)
        .then(async (response) => {
          const result = await response.json();
          this.address = result.address
          this.display_name = result.display_name
          return result
        })
    }
  }
}
</script>


<style scoped lang="scss">
.mycolor {
    border-radius: 14px;
}
</style>
