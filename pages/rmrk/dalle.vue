<template>
  <DalleMint />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import DalleMint from '@/components/rmrk/Create/DalleMint.vue'

@Component({
  components: {
    DalleMint,
  },
  head() {
    const title = 'KodaDot | Low fees and low carbon minting'
    const metaData = {
      title,
      type: 'article',
      description: 'Create carbonless NFTs with low on-chain fees',
      url: '/rmrk/creative',
      image: `${this.$config.baseUrl}/k_card_mint.png`,
    }
    return {
      title,
      meta: [...this.$seoMeta(metaData)],
    }
  },
})
export default class DalleMintPage extends Vue {
  layout() {
    return 'centered-half-layout'
  }
}
</script>
