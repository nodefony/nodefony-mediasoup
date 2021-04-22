<template>
<v-card width="100%" height="100%" flat ref="card">
  <v-list class="mx-4">
    <v-list-item three-line>
      <v-list-item-avatar tile size="30">
        <img src="@/assets/mediasoup.png" alt="mediasoup">
      </v-list-item-avatar>
      <v-list-item-content>
        <div class="overline mb-4">
          Mediasoup ROOM
        </div>
      </v-list-item-content>
    </v-list-item>
    <v-row v-if="entity" dense>
      <v-col cols="" class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            {{room.id}}
          </v-card-title>
          <v-card-subtitle>{{entity.description}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="" class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            {{$t("rooms.access")}}
          </v-card-title>
          <v-card-subtitle>{{entity.access}}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="" class="display-3">
        <v-card color="#385F73" dark>
          <v-card-title class="text-h5">
            {{$t("rooms.waiting")}}
          </v-card-title>
          <v-card-subtitle>
            {{entity.waitingconnect}}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-list>
  <v-divider class="mb-2"></v-divider>

  <!--v-list-item three-line>
    <v-list-item-content>
      <div class="overline mb-4">
        Meeting
      </div>
      <v-list-item-title class="headline mb-1">
        {{room.id}}
      </v-list-item-title>
      <v-list-item-subtitle>id : {{room.id}}</v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-avatar tile size="50">
      <img src="@/assets/mediasoup.png" alt="mediasoup">
    </v-list-item-avatar>
  </v-list-item>
  <v-list v-if='entity'>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>{{entity.name}}</v-list-item-title>
        <v-list-item-subtitle>{{$t("name")}}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>{{entity.description}}</v-list-item-title>
        <v-list-item-subtitle>{{$t("rooms.description")}}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>{{entity.access}}</v-list-item-title>
        <v-list-item-subtitle>{{$t("rooms.access")}}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-row>
          <v-col cols="3">
            <v-list-item-title>{{$t("rooms.waiting")}}</v-list-item-title>
            <v-list-item-subtitle>{{$t("rooms.hall")}}</v-list-item-subtitle>
          </v-col>
          <v-col cols="9">
            <v-switch :disabled="true" v-model="entity.waitingconnect"></v-switch>
          </v-col>
        </v-row>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="green--text" v-if="entity.secure">
          <v-icon left color="green"> mdi-lock </v-icon>{{$t("rooms.secure")}}
        </v-list-item-title>
        <v-list-item-title class="red--text" v-else>
          <v-icon left color="red"> mdi-lock-off </v-icon>{{$t("rooms.unsecure")}}
        </v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-list-item>
      <v-list-item-icon>
        <v-icon color="indigo">
          mdi-shield-account
        </v-icon>
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title>
          <v-chip class="mx-2 my-1" x-small v-for="user in entity.users" :key="`${user.username}-chip`">
            {{ user.username }}
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle>Administrators</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>

  </v-list-->
  <v-container fluid class="mx-2">
    <v-data-table dense fixed-header :headers="peersHeaders" :items="peers" :items-per-page="15" class="elevation-6" show-expand :single-expand="true">
      <template v-slot:item.id="{ item }">
        <v-chip x-small dark @click="$router.push({ name: 'User', params:{username:item.id}})">
          {{ item.id }}
        </v-chip>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" style="padding:0px">
          <user-card :room="room" :user="item" />
        </td>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn dark v-if="item.status == 'waiting'" x-small @click="authorise(item)">Authorised</v-btn>
      </template>
      <template v-slot:no-data>
      </template>
    </v-data-table>
  </v-container>
</v-card>
</template>

<script>
// @ is an alias to /src
import userCard from '@/plugins/mediasoup/components/userCard';

export default {
  name: 'roomCard',
  components: {
    "user-card": userCard,
  },
  props: {
    room: {
      type: Object,
      default: null
    },
    entity: {
      type: Object,
      default: null
    },
    peers: {
      type: Array,
      default: () => {
        return [];
      }
    },
  },
  data() {
    return {
      loading: false,
      message: null
    }
  },
  watch: {
    message(value) {
      this.notify(value);
    }
  },
  mounted() {

  },
  computed: {
    peersHeaders() {
      return [{
        text: "name",
        align: 'start',
        sortable: true,
        value: 'id'
      }, {
        text: "status",
        align: 'start',
        sortable: true,
        value: 'status'
      }, {
        text: "producers",
        align: 'start',
        sortable: true,
        value: 'nbProducers',
      }, {
        text: "consumers",
        align: 'start',
        sortable: true,
        value: 'nbConsumers',
      }, {
        text: "transports",
        align: 'start',
        sortable: true,
        value: 'nbTransports',
      }, {
        text: "dataProducers",
        align: 'start',
        sortable: true,
        value: 'nbDataProducers',
      }, {
        text: "dataConsumers",
        align: 'start',
        sortable: true,
        value: 'nbDataConsumers',
      }, {
        text: "",
        align: 'center',
        sortable: true,
        value: "actions"
      }];
    }
  },
  methods: {
    authorise(peer) {
      return this.$mediasoup.request(`meetings/${this.room.id}/${peer.id}/authorise`, "PUT")
        .then((data) => {
          this.loading = false;
          return data.result;
        })
        .catch(async (e) => {
          this.loading = false;
          this.message = this.log(e.message, "ERROR");
        });
    }
  }

}
</script>

<style scoped>
/* local styles */
</style>
