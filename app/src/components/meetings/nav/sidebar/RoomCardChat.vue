<template>
<v-card height="100%" width="100%" style="border:none" flat tile>
  <v-toolbar width="100%" color="teal darken-4" dark class="fixed-bar">
    <v-btn icon class="">
      <v-icon dark @click="setSideBar(undefined)">
        mdi-message-text
      </v-icon>
    </v-btn>
    <v-toolbar-title>Messages</v-toolbar-title>

    <v-spacer></v-spacer>
  </v-toolbar>
  <v-timeline dense clipped class=" pa-0" height="100%" width="100%" style="margin-top:250px">
    <v-timeline-item color="teal darken-4" fill-dot class="white--text fixed-bar pt-3" dense key="input" style="top:65px;z-index:999;background-color:#E0F2F1;width:100%;">
      <template v-slot:icon>
        <span>{{peer.id}}</span>
      </template>

      <v-container fluid>
        <!--input-message v-model="input" /-->
        <v-textarea v-model="input" clear-icon="mdi-close-circle" @keydown.enter="eventsImput" @paste="eventsImput" @dragstart="eventsImput" @dragenter="eventsImput" @dragleave="eventsImput" @dragover="eventsImput" @drop.prevent.stop="eventsImput"
          auto-grow no-resize clearable label="Leave a comment.." rows="1" row-height="50" class="ml-1">
          <!--template v-slot:append>
          <v-btn small depressed @click="eventsImput" style="position:absolute;bottom:-40px;right:15px">
            Post
          </v-btn>
        </template-->
        </v-textarea>
      </v-container>
    </v-timeline-item>

    <v-slide-x-transition v-if="timeline.length" group name="fade">

      <v-timeline-item v-for="(message, index) in timeline" :key="index" class="mb-4" color="teal accent-4" dense>
        <template v-slot:icon>
          <span v-text="message.from.id"></span>
        </template>
        <v-row justify="space-between">
          <v-card v-if="message.ogp">
            <div class="d-flex flex-no-wrap justify-space-between">
              <div>
                <v-card-title class="headline" v-if="message.ogp['og:title']" v-text="message.ogp['og:title'][0] ">
                </v-card-title>
                <v-card-subtitle v-if="message.ogp['og:site_name']" v-text="message.ogp['og:site_name'][0]">
                </v-card-subtitle>
                <v-card-text v-if="message.ogp['og:description']">
                  {{ message.ogp['og:description'][0] }}
                </v-card-text>
                <v-card-actions v-if="message.ogp['og:url']">
                  <v-btn outlined rounded text link :src="message.ogp['og:url'][0]">
                    {{ message.ogp['og:site_name'][0]}}
                  </v-btn>
                </v-card-actions>
              </div>
              <v-avatar v-if="message.ogp['og:video']" class="ma-3" size="125" tile>
                <video controls v-if="message.ogp['og:video']" :src=" message.ogp['og:video'][0]" />
              </v-avatar>
              <v-avatar v-else-if="message.ogp['og:image']" class="ma-3" size="125" tile>
                <v-img :src="message.ogp['og:image'][0]"></v-img>
              </v-avatar>
            </div>
          </v-card>

          <v-col cols="7" v-else-if="message.html" v-html="message.html"></v-col>
          <v-col cols="7" v-else-if="message.url" v-html="message.url"></v-col>
          <v-col cols="7" v-else-if="message.uri" v-html="message.uri"></v-col>
          <v-col cols="7" v-else-if="message.text" v-text="message.text"></v-col>
          <v-col cols="7" v-else-if="message.message" v-text="message.message"></v-col>
          <v-col cols="7" v-else-if="message.files && message.files[0]" v-text="message.files[0]"></v-col>
          <v-col class="text-right" cols="5" v-text="message.formatTime"></v-col>

        </v-row>
      </v-timeline-item>
    </v-slide-x-transition>
    <v-dialog v-model="dialog" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">
          File ?
        </v-card-title>
        <v-card-text></v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="disagree">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="agree">
            Agree
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-timeline>
</v-card>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';
//import urlRegex from 'url-regex';
//import InputMessage from "@/components/meetings/nav/sidebar/messages/Message";
export default {
  name: 'MenuChat',
  components: {
    //"input-message": InputMessage
  },
  data() {
    return {
      input: null,
      data: null,
      nonce: 0,
      dialog: false
    }
  },
  destroyed() {
    //this.room.removeListener("onDataConsumerMessage", this.eventsMessage);
  },
  mounted() {
    if (this.room) {
      //this.room.on("onDataConsumerMessage", this.eventsMessage);
    }
  },
  computed: {
    ...mapGetters({
      room: 'getRoom',
      peer: 'getPeer',
      chatMessages: 'getChatMessages'
    }),
    ...mapGetters([
      //'peers'
    ]),
    timeline() {
      const tab = this.chatMessages.map((message) => {
        let parser = this.parseMessage(message.message);
        parser.from = message.from;
        return parser;
      });
      return tab.slice().reverse()
    },
    getUnreadMessage() {
      return this.chatMessages.length
    }
  },

  methods: {
    ...mapMutations([
      'setChatMessage',
      'setSideBar'
    ]),
    parseMessage(message = {}) {
      if (message) {
        if (message instanceof ArrayBuffer) {
          //let file = await this.previewFile(new Blob([message.message]));
          //message.file = file
          //return message;
        }
        if (message && typeof message === "string") {
          let data = null;
          try {
            data = JSON.parse(message);
          } catch (e) {
            data = message
          }
          message = data;
        }
      }
      return message
    },
    agree() {
      this.dialog = false;
      window.open(this.data);
      this.data = null;
    },
    disagree() {
      this.dialog = false;
      this.data = null;
    },
    async convertFile(file) {
      return new Promise((resolve, reject) => {
        try {
          let reader = new FileReader()
          reader.readAsArrayBuffer(file)
          reader.onloadend = () => {
            return resolve(reader)
          }
        } catch (e) {
          return reject(e);
        }
      });
    },
    async previewFile(file) {
      return new Promise((resolve, reject) => {
        try {
          let reader = new FileReader()
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            return resolve(reader)
          }
        } catch (e) {
          return reject(e);
        }
      });
    },

    async eventsImput(event) {
      switch (event.type) {
        case "keydown":
          {
            if (!event.shiftKey) {
              return this.post(null, this.input);
            }
            break;
          }
        case "click":
          //case "keydown":
          {
            return this.post(null, this.input);
          }
        case "paste":
          {
            //return this.post(null, this.input);
            break;
          }
        case "dragstart":
          //console.log("dragstart")
          break;
        case "dragover":
          //console.log(event.dataTransfer.types);
          //console.log("dragover")
          break;
        case "dragleave":
          //console.log("dragleave")
          break;
        case "dragenter":
          //console.log("dragenter")
          break;
        case "drop":
          {
            try {
              //let data = await this.entryParser(event.dataTransfer);
              //this.post(this.comment(this.peer, data));
            } catch (e) {
              this.log(e, "ERROR");
              throw e;
            }
            break;
          }
        default:
          this.log(event.type, "DEBUG");
      }
    },
    post(to = null, data) {
      if (!data) {
        return
      }
      if (this.room) {
        if (data.buffer) {
          this.room.sendChatMessage(data.buffer);
        } else {
          let time = null;
          if (data && data.time) {
            time = data.time;
          } else {
            time = Date.now();
          }
          let proto = {
            uuid: this.$nodefony.client.generateId(),
            to: to,
            message: data,
            time,
            buffer: null
          };
          this.room.sendChatMessage(JSON.stringify(proto));
          this.input = "";
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.fixed-bar {
    position: fixed;
    top: 0;
    /* for Safari */
    z-index: 1000;
}
</style>
