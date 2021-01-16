<template>
<v-window class="nodefony--background" dark>
  <h1> 404 not Found</h1>
</v-window>
</template>
<script>
export default {
  name: '404'

}
</script>

<style scoped lang="scss">
  .v-text-field {
      width: 600px;
  }

  .nodefony--background {
      position: relative;
      height: 100vh;
      width: 100%;
      /*display: flex;
      align-items: center;
      justify-content: center;*/
      background-image: url("../assets/chateau-if.jpg");
      background-size: cover;
      overflow: hidden;
  }

  .nodefony--background::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background-color: rgba(0,0,0,0.65);
  }
  </style>
