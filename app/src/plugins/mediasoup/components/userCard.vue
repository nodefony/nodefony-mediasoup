<template>
<v-card width="100%" height="100%" ref="card">
  <v-list class="mx-4">
    <v-list-item three-line>
      <v-list-item-avatar tile size="30">
        <img src="@/assets/mediasoup.png" alt="mediasoup">
      </v-list-item-avatar>
      <v-list-item-content>
        <div class="overline mb-4">
          Mediasoup USER
        </div>
      </v-list-item-content>
    </v-list-item>
    <v-row dense>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            {{user.id}}
          </v-card-title>
          <v-card-subtitle v-if="user.stats.user">{{user.stats.user.name}} {{user.stats.user.surname}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Device
          </v-card-title>
          <v-card-subtitle>{{user.stats.device ? user.stats.device.name : "undefined"}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            Status
          </v-card-title>
          <v-card-subtitle>{{user.status}}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-list>
  <v-divider></v-divider>

  <v-sheet elevation="12" class="" v-if="user.stats">
    <v-container fluid class="ma-auto">
      <v-tabs v-model="tab" background-color="primary" show-arrows dark>
        <v-tabs-slider color="teal lighten-3"></v-tabs-slider>
        <v-tab>
          Transports
        </v-tab>
        <v-tab>
          Producers
        </v-tab>
        <v-tab>
          Consumers
        </v-tab>
        <v-tab>
          DataProducers
        </v-tab>
        <v-tab>
          DataConsumers
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-data-table dense hide-default-footer fixed-header :headers="transportsHeaders" :items="this.transports" :items-per-page="itemsPerPage" show-expand :single-expand="true" :page.sync="pageT" @page-count="pageCountT = $event">
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" style="padding:0px">
                <transport-card :transport="item" />
              </td>
            </template>
            <template v-slot:item.stats="{ item, header }">
              <div v-if="header.text === 'bytesReceived'" class="grey--text">
                {{item.stats[0].bytesReceived}}
              </div>
              <div v-if="header.text === 'bytesSent'" class="grey--text">
                {{item.stats[0].bytesSent}}
              </div>
              <div v-if="header.text === 'type'" class="grey--text">
                {{item.stats[0].type}}
              </div>
              <div v-if="header.text === 'protocol'" class="grey--text">
                {{item.stats[0].iceSelectedTuple? item.stats[0].iceSelectedTuple.protocol: ''}}
              </div>
              <div v-if="header.text === 'localIp'" class="grey--text">
                {{item.stats[0].iceSelectedTuple ? item.stats[0].iceSelectedTuple.localIp :''}}
              </div>
              <div v-if="header.text === 'remoteIp'" class="grey--text">
                {{item.stats[0].iceSelectedTuple ? item.stats[0].iceSelectedTuple.remoteIp : ''}}
              </div>
            </template>
            <template v-slot:item.appData="{ item }">
              <div class="grey--text">
                {{(item.appData && item.appData.producing) ? "producing": "consuming" }}
              </div>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination v-model="pageT" :length="pageCountT"></v-pagination>
          </div>
        </v-tab-item>

        <v-tab-item>
          <v-data-table dense hide-default-footer fixed-header :headers="producersHeaders" :items="this.producers" :items-per-page="itemsPerPage" show-expand :single-expand="true" :page.sync="pageP" @page-count="pageCountP = $event">
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" style="padding:0px">
                <producer-card :producer="item" />
              </td>
            </template>
            <template v-slot:item.stats="{ item, header }">
              <div v-if="item.stats[0] && header.text === 'byteCount'" class="grey--text">
                {{item.stats[0].byteCount}}
              </div>
              <div v-if="item.stats[0] && header.text === 'closed'" class="grey--text">
                {{item.stats[0].closed}}
              </div>
              <div v-if="item.stats[0] && header.text === 'kind'" class="grey--text">
                {{item.stats[0].kind}}
              </div>
              <div v-if="item.stats[0] && header.text === 'type'" class="grey--text">
                {{item.stats[0].type}}
              </div>
              <div v-if="item.stats[0] && header.text === 'mimeType'" class="grey--text">
                {{item.stats[0].mimeType}}
              </div>
              <div v-if="header.text === 'paused'" class="grey--text">
                {{item.paused}}
              </div>
            </template>
            <template v-slot:item.appData="{ item }">
              <div class="grey--text">
                {{JSON.stringify(item.appData)}}
              </div>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination v-model="pageP" :length="pageCountP"></v-pagination>
          </div>
        </v-tab-item>

        <v-tab-item>
          <v-data-table dense hide-default-footer fixed-header :headers="consumersHeaders" :items="this.consumers" :items-per-page="itemsPerPage" show-expand :single-expand="true" :page.sync="pageC" @page-count="pageCountC = $event">
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" style="padding:0px">
                <consumer-card :consumer="item" />
              </td>
            </template>
            <template v-slot:item.stats="{ item, header }">
              <div v-if="header.text === 'byteCount'" class="grey--text">
                {{item.stats[0].byteCount}}
              </div>
              <div v-if="header.text === 'closed'" class="grey--text">
                {{item.stats[0].closed}}
              </div>
              <div v-if="header.text === 'kind'" class="grey--text">
                {{item.stats[0].kind}}
              </div>
              <div v-if="header.text === 'type'" class="grey--text">
                {{item.stats[0].type}}
              </div>
              <div v-if="header.text === 'mimeType'" class="grey--text">
                {{item.stats[0].mimeType}}
              </div>
              <div v-if="header.text === 'paused'" class="grey--text">
                {{item.paused}}
              </div>
            </template>
            <template v-slot:item.appData="{ item }">
              <div class="grey--text">
                {{JSON.stringify(item.appData)}}
              </div>
            </template>
            <template v-slot:item.producerPaused="{ item }">
              <div class="grey--text">
                {{item.producerPaused}}
              </div>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination v-model="pageC" :length="pageCountC"></v-pagination>
          </div>
        </v-tab-item>

        <v-tab-item>
          <v-data-table dense hide-default-footer fixed-header :headers="dataProducerHeaders" :items="this.dataProducers" :items-per-page="itemsPerPage" show-expand :single-expand="true" :page.sync="pageDP" @page-count="pageCountDP = $event">
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" style="padding:0px">
                <producer-card :producer="item" />
              </td>
            </template>
            <template v-slot:item.stats="{ item, header }">
              <div v-if="header.text === 'messagesReceived'" class="grey--text">
                {{item.stats[0].messagesReceived}}
              </div>
            </template>
            <template v-slot:item.appData="{ item }">
              <div class="grey--text">
                {{JSON.stringify(item.appData)}}
              </div>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination v-model="pageDP" :length="pageCountDP"></v-pagination>
          </div>
        </v-tab-item>

        <v-tab-item>
          <v-data-table dense hide-default-footer fixed-header :headers="dataConsumerHeaders" :items="this.dataConsumers" :items-per-page="itemsPerPage" show-expand :single-expand="true" :page.sync="pageDC" @page-count="pageCountDC = $event">
            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length" style="padding:0px">
                <consumer-card :consumer="item" />
              </td>
            </template>
            <template v-slot:item.stats="{ item, header }">
              <div v-if="header.text === 'messagesSent'" class="grey--text">
                {{item.stats[0].messagesSent}}
              </div>
            </template>

            <template v-slot:item.appData="{ item }">
              <div class="grey--text">
                {{JSON.stringify(item.appData)}}
              </div>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination v-model="pageDC" :length="pageCountDC"></v-pagination>
          </div>
        </v-tab-item>

      </v-tabs-items>
    </v-container>
  </v-sheet>

</v-card>
</template>

<script>
// @ is an alias to /src
import transportCard from '@/plugins/mediasoup/components/transportCard';
import producerCard from '@/plugins/mediasoup/components/producerCard';
import consumerCard from '@/plugins/mediasoup/components/consumerCard';

export default {
  name: 'userCard',
  components: {
    "transport-card": transportCard,
    "producer-card": producerCard,
    "consumer-card": consumerCard
  },
  props: {
    room: {
      type: Object,
      default: null
    },
    user: {
      type: Object,
      default: null
    }
  },
  data(vm) {
    return {
      tab: null,
      search: "",
      transports: [],
      producers: [],
      consumers: [],
      dataProducers: [],
      dataConsumers: [],
      pageT: 1,
      pageCountT: 0,
      pageP: 1,
      pageCountP: 0,
      pageC: 1,
      pageCountC: 0,
      pageDP: 1,
      pageCountDP: 0,
      pageDC: 1,
      pageCountDC: 0,
      itemsPerPage: 5,
    }
  },

  watch: {
    "user.stats.transports": {
      handler(val) {
        this.transports = this.objToTab(val);
      }
    },
    "user.stats.producers": {
      handler(val) {
        this.producers = this.objToTab(val);
      }
    },
    "user.stats.consumers": {
      handler(val) {
        this.consumers = this.objToTab(val);
      }
    },
    "user.stats.dataProducers": {
      handler(val) {
        this.dataProducers = this.objToTab(val);
      }
    },
    "user.stats.dataConsumers": {
      handler(val) {
        this.dataConsumers = this.objToTab(val);
      }
    }
  },

  mounted() {
    if (this.user.stats) {
      this.transports = this.objToTab(this.user.stats.transports);
      this.producers = this.objToTab(this.user.stats.producers);
      this.consumers = this.objToTab(this.user.stats.consumers);
      this.dataProducers = this.objToTab(this.user.stats.dataProducers);
      this.dataConsumers = this.objToTab(this.user.stats.dataConsumers);
    }
  },

  computed: {
    /*nbTransports() {
      if (this.transports) {
        return this.transports.length
      }
      return 0;
    },
    nbProducers() {
      if (this.producers) {
        return this.producers.length
      }
      return 0;
    },
    nbConsumers() {
      if (this.consumers) {
        return this.consumers.length
      }
      return 0;
    },
    nbDataConsumers() {
      if (this.dataConsumers) {
        return this.dataConsumers.length
      }
      return 0;
    },
    nbDataProducers() {
      if (this.dataProducers) {
        return this.dataProducers.length
      }
      return 0;
    },*/

    transportsHeaders() {
      return [{
        text: "id",
        align: 'start',
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
        value: 'stats'
      }, {
        text: "closed",
        align: 'start',
        value: 'closed'
      }, {
        text: "Application",
        sortable: false,
        value: 'appData'
      }];
    },
    producersHeaders() {
      return [{
        text: "id",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "byteCount",
        align: 'start',
        value: 'stats'
      }, {
        text: "kind",
        align: 'start',
        value: 'stats'
      }, {
        text: "mimeType",
        align: 'start',
        value: 'stats'
      }, {
        text: "paused",
        align: 'start',
        value: 'stats'
      }, {
        text: "type",
        align: 'start',
        sortable: true,
        value: 'stats'
      }, {
        text: "closed",
        align: 'start',
        sortable: true,
        value: 'closed'
      }, {
        text: "Application",
        value: 'appData'
      }];
    },
    consumersHeaders() {
      return [{
        text: "id",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "byteCount",
        align: 'start',
        value: 'stats'
      }, {
        text: "kind",
        align: 'start',
        value: 'stats'
      }, {
        text: "mimeType",
        align: 'start',
        value: 'stats'
      }, {
        text: "paused",
        align: 'start',
        value: 'stats'
      }, {
        text: "ProcuderPaused",
        align: 'start',
        value: 'producerPaused'
      }, {
        text: "type",
        align: 'start',
        sortable: true,
        value: 'stats'
      }, {
        text: "closed",
        align: 'start',
        sortable: true,
        value: 'closed'
      }, {
        text: "Application",
        value: 'appData'
      }];
    },
    dataConsumerHeaders() {
      return [{
        text: "id",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "messagesSent",
        align: 'start',
        value: 'stats'
      }, {
        text: "kind",
        align: 'start',
        value: 'kind'
      }, {
        text: "protocol",
        align: 'start',
        value: 'protocol'
      }, {
        text: "type",
        align: 'start',
        sortable: true,
        value: 'type'
      }, {
        text: "closed",
        align: 'start',
        sortable: true,
        value: 'closed'
      }, {
        text: "Application",
        value: 'appData'
      }]
    },
    dataProducerHeaders() {
      return [{
        text: "id",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "messagesReceived",
        align: 'start',
        value: 'stats'
      }, {
        text: "kind",
        align: 'start',
        value: 'kind'
      }, {
        text: "protocol",
        align: 'start',
        value: 'protocol'
      }, {
        text: "type",
        align: 'start',
        sortable: true,
        value: 'type'
      }, {
        text: "closed",
        align: 'start',
        sortable: true,
        value: 'closed'
      }, {
        text: "Application",
        value: 'appData'
      }]
    }
  },
  methods: {
    objToTab(obj) {
      let tab = [];
      for (let id in obj) {
        let ele = {
          id: id,
          ...obj[id]
        }
        tab.push(ele);
      }
      return tab;
    }
  }
}
</script>

<style scoped>
/* local styles */
</style>
