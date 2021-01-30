<template>
<v-toolbar fixed outlined flat width="100%" class="ma-0 pa-0" style="top: 0;position:fixed; z-index:1000">

  <v-toolbar-title>
    <v-btn text @click="showMedia">
      <img src="@/assets/mediasoup.png" />
      <span class="hidden-sm-and-down ml-2">{{roomid}}</span>
    </v-btn>
    <span class="hidden-sm-and-down ml-2 subtitle-1">{{getRoomEntity.description}}</span>
  </v-toolbar-title>
  <v-spacer></v-spacer>

  <v-row v-if="peer && room" align="center">
    <v-btn x-small class="mx-4" fab @click="toogleAudio">
      <v-icon v-if="hasAudio">
        mdi-volume-high
      </v-icon>
      <v-icon v-else>
        mdi-volume-off
      </v-icon>

    </v-btn>
    <v-btn x-small class="mx-4" fab @click="toogleVideo">
      <v-icon v-if="hasVideo">
        mdi-video-outline
      </v-icon>
      <v-icon v-else>
        mdi-video-off
      </v-icon>

    </v-btn>
    <v-btn x-small class="mx-4" fab @click="toogleShare">
      <v-icon v-if="hasScreen">
        mdi-monitor-share
      </v-icon>
      <v-icon v-else>
        mdi-monitor-off
      </v-icon>
    </v-btn>

    <v-spacer></v-spacer>
    <v-btn icon @click="toogleSlider">
      <v-badge :content="nbPeers" :value="nbPeers" color="green">
        <v-icon>
          mdi-account-group
        </v-icon>
      </v-badge>
    </v-btn>

    <v-btn x-small class="ml-4" fab @click="toogleMedia">
      <v-icon v-if="media">
        mdi-application-import
      </v-icon>
      <v-icon v-else>
        mdi-application-export
      </v-icon>
    </v-btn>
    <v-spacer></v-spacer>

    <v-btn small dark rounded color="red" @click="quit">
      <v-icon small class="ml-1 mr-2">
        mdi-location-exit
      </v-icon>
      {{$t('Exit')}}
    </v-btn>

  </v-row>

  <v-spacer></v-spacer>

  <!--v-menu class="ml-5" v-if="room" :close-on-content-click="false" :nudge-width="200" offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn small icon class="mx-2" v-bind="attrs" v-on="on">
        <v-icon>
          mdi-dots-vertical
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-list dense nav>
        <v-list-item-group mandatory v-model="selectedLayout" color="primary">
          <v-list-item @click="selectLayout" key="grille">
            <v-list-item-icon>
              <v-icon color="indigo">
                mdi-grid
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Grille</v-list-item-title>
              <v-list-item-subtitle>all participants</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item @click="selectLayout" key="focus">
            <v-list-item-icon>
              <v-icon color="indigo">
                mdi-focus-field
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Focus</v-list-item-title>
              <v-list-item-subtitle>Auto focus participants</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-menu-->

  <v-btn-toggle v-if="room" v-model="drawer" rounded small>
    <v-btn small>
      <v-badge :content="nbWaiting" :value="nbWaiting" color="green">
        <v-icon small dark>
          mdi-account-multiple
        </v-icon>
      </v-badge>
    </v-btn>
    <v-btn small>
      <v-badge :content="nbUnreadMessage" :value="nbUnreadMessage" color="green">
        <v-icon small dark>
          mdi-message-text
        </v-icon>
      </v-badge>
    </v-btn>
  </v-btn-toggle>

  <bar-avatar class="mr-2 ml-8" color="blue" v-if="isAuthenticated" />
</v-toolbar>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';
import BarAvatar from '@/components/layouts/avatar.vue';

export default {
  name: 'RoomToolBarTop',
  components: {
    "bar-avatar": BarAvatar
  },
  props: {
    selected: {
      type: Number,
      default: 0
    },
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {
      selectedLayout: [vm.selected]
    }
  },
  mounted() {},
  computed: {
    ...mapGetters({
      room: 'getRoom',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'getRoomEntity',
      'isAuthenticated',
      'hasAudio',
      'hasVideo',
      'hasScreen',
      'audioStream',
      'videoStream',
      'webcam',
      'microphone',
      //'peers',
      'getPeers',
      'nbWaiting',
      'nbUnreadMessage',
      'media',

    ]),
    drawer: {
      set(value) {
        this.setSideBar(value)
      },
      get() {
        return this.getSideBar;
      }
    },
    nbPeers() {
      const res = this.getPeers.filter((peer) => {
        if (peer.status === 'joined') {
          return peer
        }
      })
      return res.length
    }
  },
  methods: {
    ...mapMutations([
      'toogleSlider',
      'displayLayout',
      'deleteMedias',
      'setMedia',
      'setSideBar',
      'toogleMedia',
      'showMedia'
    ]),
    selectLayout(event) {
      this.$emit("layoutchange", this.selectedLayout, event);
    },
    quit(event) {
      this.$emit("quit", event);
    },
    async toogleVideo() {
      this.log(`Video : `);
      // tag
      if (this.hasVideo) {
        await this.room.disableWebcam();
        //return this.pauseVideoTag();
        this.deleteMedias("video")
      } else {
        await this.room.enableWebcam(null, this.webcam);
        //return this.playVideoTag();
        this.setMedia("video");
      }
    },
    async toogleAudio() {
      this.log(`Audio : `);
      if (!this.room.micProducer) {
        await this.room.enableMic(null, this.microphone);
        this.setMedia("audio");
        return;
      }
      // tag
      if (this.hasAudio) {
        await this.room.muteMic()
        //this.muteTag();
        this.deleteMedias("audio")
      } else {
        await this.room.unmuteMic()
        //this.demuteTag();
        this.setMedia("audio");
      }

    },
    toogleShare() {
      this.log(`Share : `);
      if (this.hasScreen) {
        return this.room.disableShare()
          .then(() => {
            this.deleteMedias("screen")
          })
      }
      return this.room.enableShare()
        .then(() => {
          this.setMedia("screen")
        })
    }
  }
}
</script>

<style scoped lang="scss">

</style>
