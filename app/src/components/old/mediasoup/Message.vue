<template>
<!--v-container style="max-width: 600px;"-->
<v-timeline dense clipped>
  <v-timeline-item fill-dot class="white--text mb-12" color="orange" large>
    <template v-slot:icon>
      <span>{{mdPeer.id}}</span>
    </template>

    <v-textarea v-model="input" @keydown.enter="dragdrop" @paste="dragdrop" @dragstart="dragdrop" @dragenter="dragdrop" @dragleave="dragdrop" @dragover="dragdrop" @drop.prevent.stop="dragdrop" label="Leave a comment.." auto-grow outlined rows="3"
      row-height="30" shaped>
      <template v-slot:append>
        <v-btn class="mx-0" depressed @click="dragdrop">
          Post
        </v-btn>
      </template>
    </v-textarea>
  </v-timeline-item>

  <v-slide-x-transition group>

    <v-timeline-item v-for="event in timeline" :key="event.id" class="mb-4" color="orange" large>
      <template v-slot:icon>
        <span v-text="event.from"></span>
      </template>
      <v-row justify="space-between">

        <v-card v-if="event.ogp">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="headline" v-if="event.ogp['og:title']" v-text="event.ogp['og:title'][0] ">
              </v-card-title>
              <v-card-subtitle v-if="event.ogp['og:site_name']" v-text="event.ogp['og:site_name'][0]">
              </v-card-subtitle>
              <v-card-text v-if="event.ogp['og:description']">
                {{ event.ogp['og:description'][0] }}
              </v-card-text>
              <v-card-actions v-if="event.ogp['og:url']">
                <v-btn outlined rounded text link :src="event.ogp['og:url'][0]">
                  {{ event.ogp['og:site_name'][0]}}
                </v-btn>
              </v-card-actions>
            </div>
            <v-avatar v-if="event.ogp['og:video']" class="ma-3" size="125" tile>
              <video controls v-if="event.ogp['og:video']" :src=" event.ogp['og:video'][0]" />
            </v-avatar>
            <v-avatar v-else-if="event.ogp['og:image']" class="ma-3" size="125" tile>
              <v-img :src="event.ogp['og:image'][0]"></v-img>
            </v-avatar>
          </div>
        </v-card>
        <v-col cols="7" v-else-if="event.html" v-html="event.html"></v-col>
        <v-col cols="7" v-else-if="event.url" v-html="event.url"></v-col>
        <v-col cols="7" v-else-if="event.uri" v-html="event.uri"></v-col>
        <v-col cols="7" v-else-if="event.text" v-text="event.text"></v-col>
        <v-col cols="7" v-else-if="event.files && event.files[0]" v-text="event.files[0]"></v-col>
        <v-col class="text-right" cols="5" v-text="event.formatTime"></v-col>

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
<!--/v-container-->
</template>
<script>
import urlRegex from 'url-regex';
export default {
  name: 'media-message',
  data: (vm) => ({
    events: [],
    input: null,
    data: null,
    nonce: 0,
    mdRoom: vm.room,
    mdPeer: vm.peer,
    dialog: false
  }),
  props: {
    room: {
      type: Object,
      default: null
    },
    peer: {
      type: Object,
      default: null
    }
  },
  mounted() {
    if (this.mdRoom) {
      this.room.on("onDataConsumerMessage", async (message) => {
        if (message.message instanceof ArrayBuffer) {
          let file = await this.previewFile(new Blob([message.message]));
          return this.comment(message.from, file)
        }
        let data = JSON.parse(message.message);
        return this.comment(message.from, data)
      });
    }

  },
  computed: {
    timeline() {
      let ele = this.events.slice().reverse()
      return ele;
    },
  },
  methods: {
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
    async entryParser(value, ogp = false) {

      let regUrl = urlRegex({
        exact: true,
        strict: false
      });
      this.log(`try ogp ==> ${ogp} Is Url ? ${value}  ====>  ${regUrl.test(value)}`);
      //let regUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
      if (ogp) {
        if (regUrl.test(value)) {
          const headers = new Headers();
          headers.append("Content-Type", "application/json");
          return window.fetch(`/service/ogp`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                url: value
              })
            }).then(async (response) => {
              let res = await response.json();
              return res.ogp || null;
            })
            .catch(() => {
              return null;
            })
        } else {
          return null;
        }
      }
      let data = {
        time: Date.now(),
        text: value,
        html: "",
        ogp: null
      }
      switch (true) {
        case (value instanceof window.DataTransfer):
          {
            data.text = value.getData("text") || data.text;
            data.html = value.getData("text/html");
            data.url = value.getData("URL");
            data.uri = value.getData("text/uri-list");
            data.files = [];
            data.items = [];
            if (data.url) {
              data.ogp = await this.entryParser(data.url, true);
            }
            if (data.text) {
              data.ogp = await this.entryParser(data.text, true);
            }
            //console.log(value.files)
            //console.log(value.items)
            if (value.items.length) {
              for (let i = 0; i < value.items.length; i++) {
                data.items.push(value.items[i])
                if (value.items[i].kind === 'file') {
                  let file = value.items[i].getAsFile();
                  if (file) {
                    //data.files.push(file);
                    let reader = await this.convertFile(file);
                    data.files.push(reader.result);
                    return reader.result
                  }
                }
              }
            } else {
              // Use DataTransfer interface to access the file(s)
              for (let i = 0; i < value.files.length; i++) {
                data.files.push(value.files[i])
              }
            }
            break;
          }
        case (regUrl.test(value)):
          {
            data.ogp = await this.entryParser(value, true);
            break;
          }
        case (typeof value === "string"):
          {
            data.text = value;
          }
      }
      return data;
    },
    async dragdrop(event) {
      switch (event.type) {
        case "click":
        case "keydown":
          {
            if (this.data) {
              return this.post(this.comment(this.mdPeer, this.data));
            }
            let data = await this.entryParser(this.input);
            return this.post(this.comment(this.mdPeer, data));
          }
        case "paste":
          {
            this.data = await this.entryParser(event.clipboardData);
            this.input = this.data.text || this.data.html;
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
              let data = await this.entryParser(event.dataTransfer);
              this.post(this.comment(this.mdPeer, data));
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
    post(data, protocol) {
      if (!data) {
        return
      }
      if (data.buffer) {
        this.mdRoom.sendChatMessage(data.buffer);
      }
      if (this.mdRoom) {
        this.mdRoom.sendChatMessage(JSON.stringify(data));
      }
    },
    comment(from, data) {
      switch (true) {
        case (data instanceof window.Blob):
        case (data instanceof window.ArrayBuffer):
          {
            return {
              buffer: data
            };
          }
        case (data instanceof window.FileReader):
          {
            this.dialog = true;
            this.events.push({
              from: from.id
            })
            this.data = data.result;
            return "dddddddd";
            //window.open(data.result)
          }
      }
      let time = null;
      if (data && data.time) {
        time = data.time;
      } else {
        time = Date.now();
      }
      const formatTime = new Date(time).toTimeString().replace(/:\d{2}\sGMT-\d{4}\s\((.*)\)/, (match, contents, offset) => {
        return ` ${contents.split(' ').map(v => v.charAt(0)).join('')}`
      })
      data.from = from.id;
      data.formatTime = formatTime;
      data.id = this.nonce++;
      this.events.push(data)
      delete data.formatTime;
      this.input = null;
      this.data = null;
      return data;
    },
  },
}
</script>
