<template>
<v-container fluid class="ma-0 pt-5 pa-3" style="width:100%;height:100%;">
  <div class="wrapper">
    <section class="c-section">
      <v-row class="mb-5" style="flex-wrap: nowrap;background-justify-space-between;color:black;width:100%;height:100%">

        <v-col cols="12" style="width:100%;height:100%;" class="d-flex align-content-start justify-space-start flex-wrap px-1">
          <preview-peer v-for="n in 200" max-width="50%" min-width="150px" max-height="100%" min-height="150px" rounded flat class="ma-1 mb-3  flex-wrap align-self-center flex-wrap flex-grow-0 video" :key="`preview-${n}`" />
        </v-col>

      </v-row>
    </section>
  </div>
</v-container>
</template>


<script>
import PreviewPeer from '@/components/meetings/medias/peers/PreviewPeer'
export default {
  name: 'gridTest',
  components: {
    'preview-peer': PreviewPeer
  },
  data(vm) {
    return {};
  }
}
</script>



<style scoped lang="scss">
@mixin grid() {
    display: flex;
    flex-wrap: wrap;

    @supports(grid-area: auto) {
        display: grid;
        grid-gap: 16px 16px;
    }
}

@mixin gridAuto() {
    margin-left: -16px;

    > * {
        margin-bottom: 16px;
        margin-left: 16px;
    }

    @media (min-width: 320px) {
        > * {
            width: calc((99%/ #{2}) - 16px);
            flex: 0 0 calc((99% / #{2}) - 16px);
        }
    }

    @media (min-width: 768px) {
        > * {
            width: calc((99%/ #{3}) - 16px);
            flex: 0 0 calc((99% / #{3}) - 16px);
        }
    }

    @media (min-width: 1024px) {
        > * {
            width: calc((99%/ #{4}) - 16px);
            flex: 0 0 calc((99% / #{4}) - 16px);
        }
    }

    @supports(grid-area: auto) {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        margin-left: 16px;
        > * {
            width: auto;
            margin-left: 0;
            margin-bottom: 0;
        }
    }
}

.wrapper {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 16px;
    padding-right: 16px;
}

.c-section {
    @include grid();
    @include gridAuto();
}

.video {
    background: tranparent;
}
</style>
