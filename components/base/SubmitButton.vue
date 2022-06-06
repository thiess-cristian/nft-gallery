<template>
  <b-field>
    <b-button
      type="is-primary"
      :icon-left="icon"
      @click="$emit('click')"
      :disabled="disabled"
      :loading="loading"
      outlined>
      {{ $t(label) }}
    </b-button>
  </b-field>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class SubmitButton extends Vue {
  @Prop(Boolean) public disabled!: boolean
  @Prop(Boolean) public loading!: boolean
  @Prop(String) public label!: string
  @Prop({ type: String, default: 'paper-plane' }) public icon!: string
}
</script>
