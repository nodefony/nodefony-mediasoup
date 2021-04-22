<template>
<v-card width="100%" height="100%" flat ref="card">
  <v-list class="mx-4">
    <v-list-item three-line>
      <v-list-item-avatar tile size="30">
        <img src="@/assets/mediasoup.png" alt="mediasoup">
      </v-list-item-avatar>
      <v-list-item-content>
        <div class="overline mb-4">
          Mediasoup ROUTER
        </div>

        <v-list-item-subtitle>{{router.id}}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-row dense>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Transports
          </v-card-title>
          <v-card-subtitle>{{router.nbTransports}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Producers
          </v-card-title>
          <v-card-subtitle>{{router.nbProcucers}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Consumers
          </v-card-title>
          <v-card-subtitle>{{router.nbConsumers}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Data Producers
          </v-card-title>
          <v-card-subtitle>{{router.nbDataProcucers}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Data Consumers
          </v-card-title>
          <v-card-subtitle>{{router.nbDataConsumers}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Application
          </v-card-title>
          <v-card-subtitle>{{router.appData}}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

  </v-list>
  <v-divider></v-divider>
  <v-container fluid class="mx-4">
    <v-tabs v-model="tab" background-color="primary" show-arrows dark>
      <v-tabs-slider color="teal lighten-3"></v-tabs-slider>
      <v-tab>
        Transports
      </v-tab>
      <v-tab>
        CAPABILITIES CODECS
      </v-tab>
      <v-tab>
        CAPABILITIES headerExtensions
      </v-tab>

    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-data-table dense fixed-header :headers="transportsHeaders" :items="this.router.transports" :items-per-page="10" :headers-length="30" :search="search" show-expand :single-expand="true">
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" style="padding:0px">
              <transport-card :transport="item" />
            </td>
          </template>
          <template v-slot:item.stats="{ item, header }">
            <div v-if="item.stats[0] && header.text === 'bytesReceived'" class="grey--text">
              {{item.stats[0].bytesReceived}}
            </div>
            <div v-if="item.stats[0] && header.text === 'bytesSent'" class="grey--text">
              {{item.stats[0].bytesSent}}
            </div>
            <div v-if="item.stats[0] && header.text === 'type'" class="grey--text">
              {{item.stats[0].type}}
            </div>
            <div v-if="item.stats[0] && header.text === 'protocol'" class="grey--text">
              {{item.stats[0].iceSelectedTuple? item.stats[0].iceSelectedTuple.protocol: ''}}
            </div>
            <div v-if="item.stats[0] && header.text === 'localIp'" class="grey--text">
              {{item.stats[0].iceSelectedTuple ? item.stats[0].iceSelectedTuple.localIp :''}}
            </div>
            <div v-if="item.stats[0] && header.text === 'remoteIp'" class="grey--text">
              {{item.stats[0].iceSelectedTuple ? item.stats[0].iceSelectedTuple.remoteIp : ''}}
            </div>
          </template>
          <template v-slot:item.appData="{ item }">
            <div class="grey--text">
              {{item.appData }}
            </div>
          </template>
        </v-data-table>
      </v-tab-item>

      <v-tab-item>
        <v-data-table dense fixed-header :headers="routerCodecHeaders" :items="this.router.capabilities.codecs" :items-per-page="10">
          <template v-slot:item.parameters="{ item }">
            <div class="grey--text">
              {{JSON.stringify(item.parameters)}}
            </div>
          </template>
        </v-data-table>
      </v-tab-item>

      <v-tab-item>
        <v-data-table dense fixed-header :headers="headerExtensions" :items="this.router.capabilities.headerExtensions" :items-per-page="10">
        </v-data-table>
      </v-tab-item>

    </v-tabs-items>
  </v-container>

</v-card>
</template>

<script>
// @ is an alias to /src
import transportCard from '@/plugins/mediasoup/components/transportCard';

export default {
  name: 'routerCard',
  components: {
    "transport-card": transportCard
  },
  props: {
    room: {
      type: Object,
      default: null
    },
    router: {
      type: Object,
      default: null
    },
    graph: {
      type: Boolean,
      default: false
    }
  },
  data(vm) {
    return {
      tab: null,
      search: "",
      routerData: null
    }
  },
  mounted() {},
  computed: {
    transportsHeaders() {
      return [{
        text: "id",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "bytesReceived",
        align: 'start',
        value: 'stats'
      }, {
        text: "bytesSent",
        align: 'start',
        value: 'stats'
      }, {
        text: "protocol",
        align: 'start',
        value: 'stats'
      }, {
        text: "localIp",
        align: 'start',
        value: 'stats'
      }, {
        text: "remoteIp",
        align: 'start',
        value: 'stats'
      }, {
        text: "type",
        align: 'start',
        sortable: true,
        value: 'stats'
      }, {
        text: "Application",
        value: 'appData'
      }];
    },
    routerCodecHeaders() {
      return [{
        text: "mimeType",
        value: 'mimeType'
      }, {
        text: "kind",
        value: 'kind'
      }, {
        text: "channels",
        align: 'start',
        sortable: true,
        value: 'channels'
      }, {
        text: "clockRate",
        value: 'clockRate'
      }, {
        text: "preferredPayloadType",
        value: 'preferredPayloadType'
      }, {
        text: "parameters",
        value: 'parameters'
      }];
    },
    headerExtensions() {
      return [{
        text: "uri",
        value: 'uri'
      }, {
        text: "kind",
        value: 'kind'
      }, {
        text: "direction",
        value: 'direction'
      }, {
        text: "preferredEncrypt",
        value: 'preferredEncrypt'
      }, {
        text: "preferredId",
        value: 'preferredId'
      }]
    }
  },
  methods: {}
}
</script>

<style scoped>
/* local styles */
</style>
