<template>
<v-container fluid>
  <v-textarea v-model="input" ref="input-message" clear-icon="mdi-close-circle" @keydown.enter="eventsImput" @paste="eventsImput" @dragstart="eventsImput" @dragenter="eventsImput" @dragleave="eventsImput" @dragover="eventsImput" @drop.prevent.stop="eventsImput"
    auto-grow no-resize clearable label="My message" rows="1" row-height="50" class="ml-1">
    <!--template v-slot:append>
    </template>
    <template v-slot:append-outer>
    </template-->
  </v-textarea>
  <v-row v-if="data && data.ogp">
    <v-card v-if="data.ogp">
      <div class="d-flex flex-no-wrap justify-space-between">
        <div>
          <v-card-title class="headline" v-if="data.ogp['og:title']" v-text="data.ogp['og:title'][0] ">
          </v-card-title>
          <v-card-subtitle v-if="data.ogp['og:site_name']" v-text="data.ogp['og:site_name'][0]">
          </v-card-subtitle>
          <v-card-text v-if="data.ogp['og:description']">
            {{ data.ogp['og:description'][0] }}
          </v-card-text>
          <v-card-actions v-if="data.ogp['og:url']">
            <v-btn outlined rounded text link :src="data.ogp['og:url'][0]">
              {{ data.ogp['og:site_name'][0]}}
            </v-btn>
          </v-card-actions>
        </div>
        <v-avatar v-if="data.ogp['og:video']" class="ma-3" size="125" tile>
          <video controls v-if="data.ogp['og:video']" :src=" data.ogp['og:video'][0]" />
        </v-avatar>
        <v-avatar v-else-if="data.ogp['og:image']" class="ma-3" size="125" tile>
          <v-img :src="data.ogp['og:image'][0]"></v-img>
        </v-avatar>
      </div>
    </v-card>
  </v-row>
</v-container>
</template>


<script>
import {
  mapGetters,
  mapMutations,
  //mapActions
} from 'vuex';
import urlRegex from 'url-regex';
export default {
  name: 'InputMessage',
  data() {
    return {
      input: "",
      data: null
    }
  },
  computed: {
    regUrl: () => {
      return urlRegex({
        exact: false,
        strict: false
      });
    }
  },
  methods: {
    isUrl() {
      //console.log("pass isUrl", this.input, this.regUrl.test(this.input))
      return this.regUrl.test(this.input)
    },
    async eventsImput(event) {
      //event.stopPropagation();
      //event.preventDefault();
      switch (event.type) {
        case "keydown":
          {
            console.log("keydown", this.input)
            if (!event.shiftKey) {
              let res = await this.entryParser(this.input)
              console.log(res)
              return this.post(res);
            }
            break;
          }
        case "click":
          console.log("click")
          //case "keydown":
          {
            return this.post(this.input);
          }
        case "paste":
          {
            //console.log("paste", event)
            //this.$refs["input-message"].reset();
            //console.log(this.$refs["input-message"])
            let txt = event.clipboardData.getData('Text')
            this.input = "";
            console.log(this.input)
            if (txt) {
              this.input = txt;
              let res = await this.entryParser(txt)
              //console.log(res)
            }
            //return this.post(res);
            break;
          }
        case "dragstart":
          console.log("dragstart")
          break;
        case "dragover":
          console.log(event.dataTransfer.types);
          //console.log("dragover")
          break;
        case "dragleave":
          console.log("dragleave")
          break;
        case "dragenter":
          console.log("dragenter")
          break;
        case "drop":
          {
            console.log("drop")
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
    post(data, protocol) {
      if (data) {
        this.$emit("post", data);
        //this.input = "";
      }
    },
    async entryParser(value, ogp = false) {
      if (!value) {
        return;
      }
      if (ogp) {
        console.log("pass OGP")
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        return await window.fetch(`/service/ogp`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              url: value
            })
          }).then(async (response) => {
            let res = await response.json();
            return res.ogp || null;
          })
          .catch((e) => {
            console.log(e)
            return null;
          })
      }

      this.data = {
        time: Date.now(),
        text: value,
        html: "",
        ogp: null
      }

      switch (true) {
        case (this.isUrl()):
          {
            console.log("pass detect URL")
            this.data.ogp = await this.entryParser(value, true);
            console.log("passss ", this.data.ogp)
            break;
          }
        case (value instanceof window.DataTransfer):
          {
            this.data.text = value.getData("text") || this.data.text;
            this.data.html = value.getData("text/html");
            this.data.url = value.getData("URL");
            this.data.uri = value.getData("text/uri-list");
            this.data.files = [];
            this.data.items = [];
            if (this.data.url) {
              this.data.ogp = await this.entryParser(this.data.url, true);
            }
            if (this.data.text) {
              this.data.ogp = await this.entryParser(this.data.text, true);
            }
            //console.log(value.files)
            //console.log(value.items)
            if (value.items.length) {
              for (let i = 0; i < value.items.length; i++) {
                this.data.items.push(value.items[i])
                if (value.items[i].kind === 'file') {
                  let file = value.items[i].getAsFile();
                  if (file) {
                    //this.data.files.push(file);
                    let reader = await this.convertFile(file);
                    this.data.files.push(reader.result);
                    return reader.result
                  }
                }
              }
            } else {
              // Use DataTransfer interface to access the file(s)
              for (let i = 0; i < value.files.length; i++) {
                this.data.files.push(value.files[i])
              }
            }
            break;
          }
        case (typeof value === "string"):
          {
            this.data.text = value;
            break;
          }
        default:
          {
            console.log("passs default ")
          }
      }
      return this.data;
    },

  }
}
</script>

<style scoped lang="scss">

</style>
