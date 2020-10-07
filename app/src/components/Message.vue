<template>
<v-container style="max-width: 600px;">
  <v-timeline dense clipped>
    <v-timeline-item fill-dot class="white--text mb-12" color="orange" large>
      <template v-slot:icon>
        <span>{{mdPeer.id}}</span>
      </template>
      <v-text-field v-model="input" hide-details flat label="Leave a comment..." solo @keydown.enter="dragdrop" @paste="dragdrop" @dragstart="dragdrop" @dragenter="dragdrop" @dragleave="dragdrop" @dragover="dragdrop" @drop.prevent.stop="dragdrop">
        <template v-slot:append>
          <v-btn class="mx-0" depressed @click="dragdrop">
            Post
          </v-btn>
        </template>
      </v-text-field>
    </v-timeline-item>

    <v-slide-x-transition group>
      <v-timeline-item v-for="event in timeline" :key="event.id" class="mb-4" color="orange" large>
        <template v-slot:icon>
          <span v-text="event.from"></span>
        </template>
        <v-row justify="space-between">
          <v-col cols="7" v-if="event.html" v-html="event.html"></v-col>
          <v-col cols="7" v-else-if="event.url" v-html="event.url"></v-col>
          <v-col cols="7" v-else-if="event.uri" v-html="event.uri"></v-col>
          <v-col cols="7" v-else-if="event.text" v-text="event.text"></v-col>
          <v-col class="text-right" cols="5" v-text="event.formatTime"></v-col>
        </v-row>
      </v-timeline-item>
    </v-slide-x-transition>

    <!--v-timeline-item class="mb-6" hide-dot>
      <span>TODAY</span>
    </v-timeline-item>

    <v-timeline-item class="mb-4" color="grey" icon-color="grey lighten-2" small>
      <v-row justify="space-between">
        <v-col cols="7">This order was archived.</v-col>
        <v-col class="text-right" cols="5">15:26 EDT</v-col>
      </v-row>
    </v-timeline-item>

    <v-timeline-item class="mb-4" small>
      <v-row justify="space-between">
        <v-col cols="7">
          <v-chip class="white--text ml-0" color="purple" label small>
            APP
          </v-chip>
          Digital Downloads fulfilled 1 item.
        </v-col>
        <v-col class="text-right" cols="5">15:25 EDT</v-col>
      </v-row>
    </v-timeline-item>

    <v-timeline-item class="mb-4" color="grey" small>
      <v-row justify="space-between">
        <v-col cols="7">
          Order confirmation email was sent to John Leider (john@vuetifyjs.com).
        </v-col>
        <v-col class="text-right" cols="5">15:25 EDT</v-col>
      </v-row>
    </v-timeline-item>

    <v-timeline-item class="mb-4" hide-dot>
      <v-btn class="mx-0" color="white">
        Resend Email
      </v-btn>
    </v-timeline-item>

    <v-timeline-item class="mb-4" color="grey" small>
      <v-row justify="space-between">
        <v-col cols="7">
          A $15.00 USD payment was processed on PayPal Express Checkout
        </v-col>
        <v-col class="text-right" cols="5">15:25 EDT</v-col>
      </v-row>
    </v-timeline-item>

    <v-timeline-item color="grey" small>
      <v-row justify="space-between">
        <v-col cols="7">
          John Leider placed this order on Online Store (checkout #1937432132572).
        </v-col>
        <v-col class="text-right" cols="5">15:25 EDT</v-col>
      </v-row>
    </v-timeline-item-->
  </v-timeline>
</v-container>
</template>
<script>
export default {
  name: 'media-message',
  data: (vm) => ({
    events: [],
    input: null,
    data:null,
    nonce: 0,
    mdRoom: vm.room,
    mdPeer: vm.peer
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
      this.room.on("onDataConsumerMessage", (message) => {
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
    async entryParser(value, ogp) {
      let regUrl = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
      if (ogp) {
        if (regUrl.test(value)) {
          const headers = new Headers();
          headers.append("Content-Type", "application/json");
          let res = await window.fetch(`/service/ogp`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              url: value
            })
          }).then((response) => {
            return response.json();
          })

          if (res) {
            return res
          }
          return null;
        } else {
          return null;
        }
      }
      let data = {
        time: (new Date()).toTimeString(),
        text: "",
        html: "",
        ogp: null
      }
      switch (true) {
        case (value instanceof window.DataTransfer):
          {
            data.text = value.getData("text");
            data.html = value.getData("text/html");
            data.url = value.getData("URL");
            data.uri = value.getData("text/uri-list");
            if (data.url) {
              data.ogp = await this.entryParser(data.url, true);
            }
            if (data.text) {
              data.ogp = await this.entryParser(data.text, true);
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
            if ( this.data){
              return this.post(this.comment(this.mdPeer, this.data) );
            }
            let data = await this.entryParser(this.input);
            return this.post(this.comment(this.mdPeer, data) );
          }
        case "paste":
          {
            this.data = await this.entryParser(event.clipboardData);
            //this.input = data;
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
              this.post(this.comment(this.mdPeer, data) );
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
      if (this.mdRoom) {
        this.mdRoom.sendChatMessage(JSON.stringify(data));
      }
    },
    comment(from, data) {
      let time = null;
      if (data && data.time) {
        time = data.time;
      } else {
        time = (new Date()).toTimeString();
      }
      const formatTime = time.replace(/:\d{2}\sGMT-\d{4}\s\((.*)\)/, (match, contents, offset) => {
        return ` ${contents.split(' ').map(v => v.charAt(0)).join('')}`
      })
      data.from = from.id;
      data.formatTime = formatTime;
      data.id = this.nonce++;
      /*let mypost = {
        from: from.id,
        id: this.nonce++,
        text: data.html ? "" : data.text,
        html: data.html ? data.html : "",
        formatTime: formatTime,
        time: time
      };*/
      this.events.push(data)
      delete data.formatTime;
      this.input = null;
      this.data = null;
      return data;
    },
  },
}
</script>
