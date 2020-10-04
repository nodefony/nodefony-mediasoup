<template>
<v-container style="max-width: 600px;">
  <v-timeline dense clipped>
    <v-timeline-item fill-dot class="white--text mb-12" color="orange" large>
      <template v-slot:icon>
        <span>{{mdPeer.id}}</span>
      </template>
      <v-text-field v-model="input" hide-details flat label="Leave a comment..." solo @keydown.enter="post">
        <template v-slot:append>
          <v-btn class="mx-0" depressed @click="post">
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
          <v-col cols="7" v-text="event.text"></v-col>
          <v-col class="text-right" cols="5" v-text="event.time"></v-col>
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
        this.comment(message.from, message.message)
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
    post() {
      if (!this.input) {
        return;
      }
      const time = (new Date()).toTimeString()
      let post = {
        from: this.mdPeer.id,
        id: this.nonce++,
        text: this.input,
        time: time.replace(/:\d{2}\sGMT-\d{4}\s\((.*)\)/, (match, contents, offset) => {
          return ` ${contents.split(' ').map(v => v.charAt(0)).join('')}`
        }),
      }
      this.events.push(post);
      if (this.mdRoom) {

        this.mdRoom.sendChatMessage(this.input.trim());
      }
      this.input = null;
    },
    comment(from, message) {
      const time = (new Date()).toTimeString()
      let post = {
        from: from.id,
        id: this.nonce++,
        text: message,
        time: time.replace(/:\d{2}\sGMT-\d{4}\s\((.*)\)/, (match, contents, offset) => {
          return ` ${contents.split(' ').map(v => v.charAt(0)).join('')}`
        }),
      };
      this.events.push(post)
    },
  },
}
</script>
