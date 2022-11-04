<template>
<!--v-container fluid class=" ma-0 pa-0" :style="container"-->
<v-container :class="[myclass, myrounded]" ref="container" fluid class="pa-0">

  <v-app-bar absolute dark :class="['ma-0','mycolor','fixed-bar',roundedNavBar]" :style="bar">
    <v-btn class="mr-5" elevation="24" v-if="navigation.shown" icon @click.stop="toogle">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-btn class="mr-10" elevation="24" icon v-if="!navigation.shown" @click.stop="toogle">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
    <slot name="toolbar"></slot>
  </v-app-bar>

  <v-navigation-drawer v-if="navigation.shown" absolute :height="vp" :width="navigation.width" ref="nav" dark v-model="navigation.shown" hide-overlay class="mycolor2" :style="nav">

    <slot name="navigation"></slot>
  </v-navigation-drawer>

  <v-sheet ref="content" :height="vp" fluid class="ma-0 pa-0" :style="content">

    <slot></slot>
  </v-sheet>
</v-container>
</template>

<script>
import BarAvatar from '@/components/layouts/avatar.vue';
export default {
  name: 'AppLayout',
  components: {
    "bar-avatar": BarAvatar
  },
  props: {
    name: {
      type: String
    },
    height: {
      type: String
    },
    rounded: {
      type: [Boolean, String],
      default: false
    },
    resize: {
      type: Boolean,
      default: false
    }
  },
  data: (inst) => ({
    drag: false,
    navigation: {
      shown: true,
      width: "400px",
      borderSize: 3
    },
    navStyle: {
      //position: "fixed",
      top: "64px!important",
      zIndex: 2
    },
    contentStyle: {
      //position: "fixed",
      //paddingTop: "65px!important"
    },
    barStyle: {
      //top: "65px",
      paddingLeft: `${inst.$vuetify.breakpoint.framework.application.left}px`
      //paddingLeft: "256px"
    },
    containerStyle: {
      //position: "fixed"
    },
    myclass: ""
  }),
  mounted() {
    this.$nextTick(() => {
      this.barStyle.paddingLeft = "0px"
    })
    if (this.resize) {
      this.setBorderWidth();
      this.setEvents();
    }
  },
  computed: {
    myrounded() {
      if (this.rounded) {
        return "rounded-t-lg"
      }
      return ""
    },
    roundedNavBar() {
      if (this.rounded) {
        return "rounded-t-lg"
      }
      return ""
    },
    vp() {
      if (this.height) {
        return this.height
      }
      return this.$vuetify.breakpoint.height - 130
    },
    appSizeLeft() {
      return this.$vuetify.breakpoint.framework.application.left
    },
    localSizeNav: {
      get() {
        if (this.$refs.nav) {
          return this.$refs.nav.computedWidth
        }
        return this.navigation.width
      },
      set(ele) {
        if (this.$refs.content) {
          //console.log(this.$refs.content)
          const el = this.$refs.content.$el;
          el.style.setProperty("padding-left", ele, "important")
        }
        return ele
      }
    },
    nav() {
      //this.navStyle.left = `${this.appSizeLeft}px!important`
      return this.navStyle
    },
    bar() {
      //this.barStyle.paddingLeft = `${this.appSizeLeft}px!important`
      return this.barStyle
    },
    content() {
      if (this.navigation.shown) {
        this.contentStyle.paddingLeft = `${this.localSizeNav}!important`
      } else {
        this.contentStyle.paddingLeft = "0px!important"
      }
      return this.contentStyle
    },
    container() {
      return this.containerStyle
    }
  },
  methods: {
    toogle() {
      this.navigation.shown = !this.navigation.shown
    },
    setBorderWidth() {
      let i = this.$refs.nav.$el.querySelector(
        ".v-navigation-drawer__border"
      );
      i.style.width = this.navigation.borderSize + "px";
      i.style.cursor = "ew-resize";
      i.style.backgroundColor = "red";
    },
    setEvents() {
      const minSize = this.navigation.borderSize;
      const el = this.$refs.nav.$el;
      const drawerBorder = el.querySelector(".v-navigation-drawer__border");
      const vm = this;
      const direction = el.classList.contains("v-navigation-drawer--right") ?
        "right" :
        "left";

      const resize = (e) => {
        this.drag = true
        document.body.style.cursor = "ew-resize";
        const el = this.$refs.nav.$el;
        const container = this.$refs.container.scrollWidth;
        const scroll = document.body.scrollWidth
        const diff = scroll - container;
        const relatif = e.clientX - diff
        //console.log(`Body : ${scroll}, COntainer ${container}, Box ${diff}, Souris (Abs) = ${e.clientX}  Souris (Rela) = ${relatif} `)
        if (!container) {
          return
        }
        let f = null
        if (direction === 'left') {
          f = relatif;
        } else {
          f = e.clientX;
        }
        this.localSizeNav = (f) + "px";
        el.style.width = f + "px";
      }

      drawerBorder.addEventListener(
        "mousedown",
        (e) => {
          this.myclass = "noselect"
          if (e.offsetX < minSize) {
            el.style.transition = "initial";
            document.addEventListener("mousemove", resize, false);
          }
        },
        false
      );

      document.addEventListener(
        "mouseup",
        () => {
          this.myclass = ""
          this.drag = false
          el.style.transition = "";
          this.navigation.width = el.style.width;
          document.body.style.cursor = "";
          document.removeEventListener("mousemove", resize, false);
        },
        false
      );
    }
  }
}
</script>


<style scoped lang="scss">
.fixed-bar {
    position: sticky;
    position: -webkit-sticky;
    /* for Safari */
    z-index: 2;
}
.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>
