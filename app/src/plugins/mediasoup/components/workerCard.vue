<template>
<v-card width="100%" height="100%" flat ref="card">
  <v-list class="mx-4">
    <v-list-item three-line>
      <v-list-item-avatar tile size="30">
        <img src="@/assets/mediasoup.png" alt="mediasoup">
      </v-list-item-avatar>
      <v-list-item-content class="mb-5">
        <div class="overline mb-4">
          Mediasoup WORKER
        </div>
        <v-row dense>
          <v-col cols="" class="display-3">
            <v-card color="#385F73" dark>
              <v-card-title class="text-h5">
                WORKER PID
              </v-card-title>
              <v-card-subtitle>{{worker.pid}}</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="" class="display-3">
            <v-card color="#385F73" dark>
              <v-card-title class="text-h5">
                CPU
              </v-card-title>
              <v-card-subtitle>{{cpu || 0}} %</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col cols="" class="display-3">
            <v-card color="#385F73" dark>
              <v-card-title class="text-h5">
                MEMORY
              </v-card-title>
              <v-card-subtitle>{{getMemoryUsage}}</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col v-if="graph" cols="" class="display-3">
            <v-card color="#385F73" dark>
              <v-card-title class="text-h5">
                messages received
              </v-card-title>
              <v-card-subtitle>{{room.status.worker.usage.ru_msgrcv}}</v-card-subtitle>
            </v-card>
          </v-col>
          <v-col v-if="graph" cols="" class="display-3">
            <v-card color="#385F73" dark>
              <v-card-title class="text-h5">
                messages sent
              </v-card-title>
              <v-card-subtitle>{{room.status.worker.usage.ru_msgsnd}}</v-card-subtitle>
            </v-card>
          </v-col>
        </v-row>
        <!--v-list-item-subtitle>room {{room.id}}</v-list-item-subtitle>
      <v-list-item-subtitle>pid : {{worker.pid}}</v-list-item-subtitle-->
      </v-list-item-content>
    </v-list-item>
  </v-list>
  <v-divider></v-divider>
  <v-container fluid class="mx-4">
    <graph-card v-if="graph" :worker="room.status.worker" :cpu="cpu" :memory="room.status.worker.usage.ru_maxrss" />
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>Worker pid : {{worker.pid}}</v-list-item-title>
          <v-list-item-subtitle v-for="(item, index) in room.status.worker.usage" :key="index">
            {{workerUsage[index]}} ( {{index}} ) : {{item }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-container>
</v-card>
</template>

<script>
// @ is an alias to /src
import graphCard from '@/plugins/vis/components/charts/realtimeChart';

export default {
  name: 'workerCard',
  components: {
    "graph-card": graphCard
  },
  props: {
    room: {
      type: Object,
      default: null
    },
    worker: {
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
      workerUsage: this.$mediasoup.workerUsage,
      utime: null,
      stime: null
    }
  },

  mounted() {

  },
  watch: {

  },
  computed: {
    cpu() {
      return this.$mediasoup.getCpuUsage(this.room.status.worker);
    },
    getMemoryUsage() {
      return this.$mediasoup.getMemoryUsage(this.room.status.worker);
    }
    /*if (this.room && this.room.status.worker.usage) {
        let usage = this.room.status.worker.usage;
        let rss = usage.ru_maxrss;
        let units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          n = parseInt(rss, 10) || 0,
          l = 0;
        while (n >= 1024) {
          n = n / 1024;
          l++;
        }
        return `${n.toFixed(2)} ${units[l]}`;
        //return (n.toFixed(n >= 10 || l < 1 ? 0 : 1) + ' ' + units[l]);
      }
      return undefined;
    }*/
  },
  methods: {
    /*getCpuUsage() {
      let res = 0;
      if (this.room && this.room.status.worker.usage) {
        let usage = this.room.status.worker.usage;
        let usertime = null;
        let systemtime = null;
        if (this.utime && this.stime) {
          usertime = (usage.ru_utime - this.utime) / 1000000;
          systemtime = (usage.ru_stime - this.stime) / 1000000;
          res = (usertime + systemtime) * 100000;
          //console.log(usertime, systemtime, (usertime + systemtime), res)
        }
        this.stime = usage.ru_stime;
        this.utime = usage.ru_utime
        //return ((usage.ru_utime + usage.ru_stime) * 100) / (utime + stime); // Total CPU Utilization
      }
      return res.toFixed(2);
    }*/
  }

}
</script>

<style scoped>
/* local styles */
</style>
