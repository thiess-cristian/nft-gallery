<template>
  <b-image
      ratio="1by1"
      class="image selectable-image"
      :class="{ 'is-selected': selected }"
      :src="src"
      alt="Some Image"
      @click.native="handleClick"
      ></b-image>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class SelectableImage extends Vue {
  @Prop(String) public src!: string
  @Prop(Number) public index!: number
  protected selected = false

  handleClick() {
    this.selected = !this.selected
    this.$emit(this.selected ? 'click' : 'remove', this.index)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables';
.is-selected {
  border: 2px $primary solid;
}
.selectable-image:hover {
  border: 2px $lightpink solid;
  cursor: pointer;
}
</style>
