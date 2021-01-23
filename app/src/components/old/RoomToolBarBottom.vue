<template>
<v-toolbar bottom outlined dense flat min-width="100%" style="position:fixed">
  <v-col class="text-center ma-0 pa-0" cols="9">
    <v-btn small class="mx-4" rounded outlined @click="toogleAudio">
      <v-icon v-if="hasAudio" left>
        mdi-volume-high
      </v-icon>
      <v-icon v-else left>
        mdi-volume-high
      </v-icon>
      <span v-if="hasAudio">
        mute audio
      </span>
      <span v-else>
        demute audio
      </span>
    </v-btn>
    <v-btn small class="mx-4" rounded outlined @click="toogleVideo">
      <v-icon v-if="hasVideo" left>
        mdi-video-outline
      </v-icon>
      <v-icon v-else left>
        mdi-video-outline
      </v-icon>
      <span v-if="hasVideo">
        Stop Video
      </span>
      <span v-else>
        Start Video
      </span>
    </v-btn>
    <v-btn small class="mx-4" rounded outlined @click="toogleShare">
      <v-icon v-if="hasScreen" left>
        mdi-monitor-share
      </v-icon>
      <v-icon v-else left>
        mdi-monitor-share
      </v-icon>
      <span v-if="hasScreen">
        Stop Sharing
      </span>
      <span>
        Share Screen
      </span>
    </v-btn>
    <v-btn small class="mx-6" fab dark color="red" @click="quit">
      <v-icon>
        mdi-close
      </v-icon>
    </v-btn>
  </v-col>
  <v-spacer></v-spacer>
  <v-col class="" cols="3">
    <v-btn-toggle v-model="drawer" multiple rounded small>
      <v-btn small>
        <v-icon left dark>
          mdi-account-multiple
        </v-icon>
        <span>
          Participants
        </span>
      </v-btn>
      <v-btn small>
        <v-icon left dark>
          mdi-message-text
        </v-icon>
        <span>
          Chat
        </span>
      </v-btn>
    </v-btn-toggle>
  </v-col>
</v-toolbar>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  mapActions
} from 'vuex';

export default {
  name: 'RoomToolBarBottom',
  props: {
    roomid: {
      type: String
    }
  },
  data(vm) {
    return {

    }
  },
  mounted() {},
  computed: {
    ...mapGetters({
      room: 'getRoom',
      peer: 'getPeer'
    }),
    ...mapGetters([
      'hasAudio',
      'hasVideo',
      'hasScreen',
      'audioStream',
      'videoStream',
      'webcam',
      'microphone',
      'getSideBar'
    ]),
    drawer: {
      set(value) {
        this.setSideBar(value)
        return value;
      },
      get() {
        return this.getSideBar;
      }
    }
  },

  methods: {
    ...mapMutations([
      'deleteMedias',
      'setMedia',
      'setSideBar'
    ]),
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
  },
}
</script>

<style scoped lang="scss">

</style>
