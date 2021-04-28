<template>
<v-container fluid>
  <div class="" ref="cpu"></div>
  <div class="" ref="memory"></div>
</v-container>
</template>

<script>
export default {
  props: {
    worker: {
      type: Object,
      default: null
    },
    cpu: {
      type: String,
      default: "0.00"
    },
    memory: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      dataset: new this.$vis.DataSet(),
      datasetMemory: new this.$vis.DataSet(),
      delay: 500,
      minScale: 0,
      maxScale: 1000000
    }
  },
  created() {

  },
  beforeMount() {

  },
  beforeDestroy() {

  },
  watch: {
    worker(val) {
      this.addCpuPoint(val.usage);
      this.addMemoryPoint(val.usage)
    },
    "$root.$i18n.locale": {
      handler(val) {
        this.$graph2d.setOptions({
          locale: val
        })
      }
    }
  },
  mounted() {
    //console.log(this.$vuetify.lang.current)
    const options = {
      //width: '100%',
      height: '200px',
      locale: this.$vuetify.lang.current || 'fr',
      start: this.$vis.moment().add(-30, 'seconds'), // changed so its faster
      end: this.$vis.moment(),
      dataAxis: {
        icons: true,
        left: {
          range: {
            max: 100,
            min: 0
          },
          title: {
            text: "CPU %"
          }
        }
      },
      drawPoints: {
        style: 'circle' // square, circle
      },
      shaded: {
        orientation: 'bottom' // top, bottom
      }
    }
    /*this.dataset.add({
      id: 0,
      content: "cpu",
      group: 0
    })*/

    this.$graph2d = new this.$vis.createGraph2d(this.$refs.cpu, this.dataset, options);
    this.renderStep(this.$graph2d);
    const optionsMemory = {
      //width: '100%',
      height: '200px',
      locale: this.$vuetify.lang.current || 'fr',
      start: this.$vis.moment().add(-30, 'seconds'), // changed so its faster
      end: this.$vis.moment(),
      dataAxis: {
        icons: true,
        left: {
          range: {
            max: 200,
            min: 0
          },
          title: {
            text: "MEMORY (Mb)"
          }
        }
      },
      drawPoints: {
        style: 'circle' // square, circle
      },
      shaded: {
        orientation: 'bottom' // top, bottom
      }
    }

    this.$graph2dMemory = new this.$vis.createGraph2d(this.$refs.memory, this.datasetMemory, optionsMemory);
    this.renderStep(this.$graph2dMemory);
  },
  computed: {
    memoryMb() {
      let mb = parseFloat(this.memory, 10);
      return (mb / 1024 / 1024).toFixed("2");
    }
  },
  methods: {
    renderStep(graph, strategy) {
      const now = this.$vis.moment();
      const range = graph.getWindow();
      const interval = range.end - range.start;
      switch (strategy) {
        case "continuous":
          graph.setWindow(now - interval, now, {
            animation: false
          });
          requestAnimationFrame(this.renderStep.bind(this, strategy));
          break;
        case "discrete":
          graph.setWindow(now - interval, now, {
            animation: false
          });
          setTimeout(this.renderStep.bind(this, strategy), this.delay);
          break;
        case "static":
        default:
          if (now > range.end) {
            graph.setWindow(now - 0.1 * interval, now + 0.9 * interval);
          }
          setTimeout(this.renderStep.bind(this, graph, strategy), this.delay);
      }
    },
    addCpuPoint(data) {
      const now = this.$vis.moment();
      const range = this.$graph2d.getWindow();
      const interval = range.end - range.start;
      //this.setScale(data)
      this.dataset.add({
        x: now,
        y: this.cpu,
        group: 0,
        label: "CPU"
      });
      const oldIds = this.dataset.getIds({
        filter: function(item) {
          return item.x < range.start - interval;
        }
      });
      if (oldIds.length) {
        //console.log(range, oldIds, interval, this.dataset.length)
        this.dataset.remove(oldIds);
      }
    },
    addMemoryPoint() {
      const now = this.$vis.moment();
      const range = this.$graph2dMemory.getWindow();
      const interval = range.end - range.start;
      //this.setScale(data)
      this.datasetMemory.add({
        x: now,
        y: this.memoryMb,
        group: 0,
        label: "Memory"
      });
      const oldIds = this.datasetMemory.getIds({
        filter: function(item) {
          return item.x < range.start - interval;
        }
      });
      if (oldIds.length) {
        //console.log(range, oldIds, interval, this.dataset.length)
        this.datasetMemory.remove(oldIds);
      }
    }
  }
}
</script>

<style scoped>
.small {
  max-width: 900px;
  margin: 150px auto;
}
</style>
