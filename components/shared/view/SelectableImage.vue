<template>
  <b-image
      ratio="1by1"
      class="image selectable-image"
      :src="src"
      alt="Some Image"
      @click.native="handleClick"
      ></b-image>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class SelectableImage extends Vue {
  @Prop(String) public src!: string

  @Emit('click')
  handleClick() {
    console.log('clicked', this.src)
    return this.src
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
.selectable-image:hover {
  border: 2px $primary solid;
  cursor: pointer;
}
</style>
