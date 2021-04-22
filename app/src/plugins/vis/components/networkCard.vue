
<template>
<v-card class="visroom" flat height="100%" min-width="400" min-height="500">
  <v-container fluid ref="network" style="min-height: 500px;min-width:400px">

  </v-container>

</v-card>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'VisRoom',
  components: {

  },
  props: {
    room: {
      type: Object,
      default: null
    },
    peers: {
      type: Array,
      default:()=>{
        return [];
      }
    },
    entity:{
      type: Object,
      default: null
    }
  },
  data() {
    return {
      network: null,
      showNetwork: false,
      nbPeers:0
    }
  },
  beforeDestroy() {
    if( this.network){
      this.network.destroy();
    }
  },
  created() {
    // This should be a Vue data property, but Vue reactivity kinda bugs Vis.
    // See here for more: https://github.com/almende/vis/issues/2524
    this.network = null;
  },
  mounted() {
    //console.log(this.room);
    this.drawNetwork();
  },
  computed: {
    network_data() {
      return  this.$vis.buildRoomNetwork(this.room, this.peers, this.entity ,this.$refs.network, this);
    }
  },
  watch:{
    peers:function(val){
      if( this.nbPeers !== val.length ){
        this.drawNetwork()
      }
      this.nbPeers = val.length;
    }
  },
  methods: {
    drawNetwork() {
      this.destroyNetwork();
      const scaleOption = {
        scale: 1.5
      };
      if (this.network) {
          this.network.setData(this.network_data);
          //this.network.moveTo(scaleOption);
          //this.network.focus(this.room.id);
          this.network.fit();
          this.network.redraw();
          this.showNetwork = true;
        return;
      }

      let options = {};
      this.network = this.$vis.createNetwork(this.$refs.network, this.network_data, options);
      // selection
      this.network.on("select",  (params) => {
        this.onSelect(params);
      });

      this.network.on("initRedraw", () => {
      });
      this.network.on("showPopup", (params) => {
      });
      this.network.on("afterDrawing", () => {
      });
      this.network.on("stabilized", () => {
        this.showNetwork = true;
        this.network.moveTo(scaleOption);
        this.network.focus(this.room.id)
      });
      setTimeout(()=>{
        this.network.setSize("100%", "600px");
        this.network.moveTo(scaleOption);
        this.network.focus(this.room.id);
        this.network.fit();
        this.network.redraw();
        this.showNetwork = true;
      });

    },

    onSelect(params){
      if( params && params.nodes.length ){
        for( let node of params.nodes ){
          console.log(node);
        }
      }
    },

    destroyNetwork() {
      this.showNetwork = false
      if (this.network !== null) {
        this.network.destroy();
        this.network = null;
      }
    }
  }
  }
  </script>

  <style scoped>
  /* local styles */
  .visroom {
    border: 1px solid lightgray;
  }
  .v-window__container {
    height: 100%
  }
  </style>
