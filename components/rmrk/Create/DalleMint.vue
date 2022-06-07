<template>
  <section>
    <br />
    <Loader v-model="isLoading" :status="status" />
    <div class="box">
      <p class="title is-size-3">
        <!-- {{ $t('mint.context') }} -->
        Dalle Minting
      </p>
      <p class="subtitle is-size-7">{{ $t('general.using') }} {{ version }}</p>
      <b-field>
        <div>
          {{ $t('computed id') }}: <b>{{ rmrkId }}</b>
        </div>
      </b-field>
      <AuthField />

      <BasicInput
          v-model="prompt"
          :label="$t('mint.nft.prompt.label')"
          :message="$t('mint.nft.prompt.message')"
          :placeholder="$t('mint.nft.prompt.placeholder')"
          expanded
          spellcheck="true"
        />

      <SubmitButton
        label="mint.ask"
        :disabled="!prompt"
        @click="ask" />

      <ImageGrid :images="images" @update="updateSelectedImages" />

      <template v-if="images.length">

      <BasicInput
          v-model="rmrkMint.name"
          :label="$t('mint.nft.name.label')"
          :message="$t('mint.nft.name.message')"
          :placeholder="$t('mint.nft.name.placeholder')"
          expanded
          spellcheck="true"
        />

      <LabeledText label="mint.nft.description.label" >
        {{ rmrkMint.description }}
      </LabeledText>

      <LabeledText label="mint.nft.count.label" >
        {{ selectedImages.length }}
      </LabeledText>

      <SubmitButton
        label="mint.submit"
        class="mt-4"
        :disabled="disabled"
        :loading="isLoading"
        @click="sub" />

      </template>

    </div>
  </section>
</template>

<script lang="ts">
import { uploadDirect } from '@/utils/directUpload'
import { emptyObject } from '@/utils/empty'
import ChainMixin from '@/utils/mixins/chainMixin'
import RmrkVersionMixin from '@/utils/mixins/rmrkVersionMixin'
import { notificationTypes, showNotification } from '@/utils/notification'
import { pinFileToIPFS, pinJson, PinningKey } from '@/utils/pinning'
import {
  basicUpdateNameFunction,
  createCollection,
  createMetadata,
  createMintInteaction,
  createMultipleNFT,
  Interaction,
  makeSymbol,
  mapAsSystemRemark, toCollectionId, unSanitizeIpfsUrl
} from '@kodadot1/minimark'
import Connector from '@kodadot1/sub-api'
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import AuthMixin from '~/utils/mixins/authMixin'
import MetaTransactionMixin from '~/utils/mixins/metaMixin'
import shouldUpdate from '~/utils/shouldUpdate'
import {
  getNftId,
  NFT,
  NFTMetadata,
  SimpleNFT
} from '../service/scheme'
import { MediaType } from '../types'
import { resolveMedia, sanitizeIpfsUrl } from '../utils'
import { askDalleMini } from '@/utils/dalle'
import { asBase64Image } from '~/utils/url'

const components = {
  AuthField: () => import('@/components/shared/form/AuthField.vue'),
  MetadataUpload: () => import('./DropUpload.vue'),
  LabeledText: () => import('@/components/shared/gallery/LabeledText.vue'),
  SubmitButton: () => import('@/components/base/SubmitButton.vue'),
  BasicInput: () =>
    import('@/components/shared/form/BasicInput.vue'),
  ImageGrid: () => import('@/components/shared/view/ImageGrid.vue'),
}

@Component<CreativeMint>({
  components,
})
export default class CreativeMint extends mixins(
  RmrkVersionMixin,
  MetaTransactionMixin,
  ChainMixin,
  AuthMixin,
) {
  private rmrkMint: SimpleNFT = {
    ...emptyObject<SimpleNFT>(),
    max: 1,
    symbol: makeSymbol(),
    name: '',
    description: '~'
  }
  private meta: NFTMetadata = emptyObject<NFTMetadata>()
  private file: File | null = null
  private price = 0
  private fileHash = ''
  private isGptLoading = false
  private images: string[] = []
  private selectedImages: number[] = []
  private prompt = ''

  protected updateMeta(value: number): void {
    this.price = value
  }

  get fileType(): MediaType {
    return resolveMedia(this.file?.type)
  }

  get rmrkId(): string {
    return this.accountId ? toCollectionId(this.accountId, this.rmrkMint.symbol) : ''
  }

  get canCalculateTransactionFees(): boolean {
    const { name, symbol, max } = this.rmrkMint
    return !!(this.price && name && symbol && max)
  }

  get disabled(): boolean {
    const { name, symbol, max } = this.rmrkMint
    return !(name && symbol && max && this.accountId)
  }

  protected updateSelectedImages(images: number[]): void {
    this.selectedImages = images
  }

  protected async ask(): Promise<void> {
    this.selectedImages = []
    this.images = []
    this.images = await askDalleMini(this.prompt).then(res => res.images.map(asBase64Image))
    this.rmrkMint.description = `Prompt for DALLE "${this.prompt}"\n
    Generated with love by KodaDot
    `
  }

  protected async sub(): Promise<void> {
    this.isLoading = true
    this.status = 'loader.ipfs'
    const { api } = Connector.getInstance()

    try {
      const meta = await this.constructMeta()
      this.rmrkMint.metadata = meta || ''

      const collection = createCollection(
        this.accountId,
        this.rmrkMint.symbol,
        this.rmrkMint.name,
        this.rmrkMint.metadata,
        0
      )

      const nftList = createMultipleNFT(
        this.rmrkMint.max,
        this.accountId,
        collection.id,
        this.rmrkMint.name,
        this.rmrkMint.metadata,
        0,
        basicUpdateNameFunction
      )

      const toRemark = mapAsSystemRemark(api)

      const collectionRemark = createMintInteaction(
        Interaction.MINT,
        this.version,
        collection
      )

      const mint = nftList.map((nft) =>
        createMintInteaction(Interaction.MINTNFT, this.version, nft)
      )

      const cb = api.tx.utility.batchAll
      const args = [toRemark(collectionRemark), ...mint.map(toRemark)]

      await this.howAboutToExecute(
        this.accountId,
        cb,
        [args],
        (blockNumber) => {
          showNotification(
            `[NFT] Saved ${this.rmrkMint.name} in block ${blockNumber}`,
            notificationTypes.success
          )
        }
      )
    } catch (e) {
      if (e instanceof Error) {
        showNotification(e.toString(), notificationTypes.danger)
        this.isLoading = false
      }
    }
  }

  public async constructMeta(): Promise<string | undefined> {
    const { file, rmrkMint } = this
    if (!file) {
      throw new ReferenceError('No file found!')
    }

    const { token }: PinningKey = await this.$store.dispatch(
      'pinning/fetchPinningKey',
      this.accountId
    )

    const fileHash = await pinFileToIPFS(file, token)

    let imageHash: string | undefined = fileHash
    let animationUrl: string | undefined = undefined

    const attributes = []

    const meta = createMetadata(
      rmrkMint.name,
      rmrkMint.description,
      imageHash,
      animationUrl,
      attributes,
      'https://kodadot.xyz',
      file.type
    )

    const metaHash = await pinJson(meta, imageHash)

    uploadDirect(file, metaHash).catch(this.$consola.warn)

    return unSanitizeIpfsUrl(metaHash)
  }

  protected navigateToDetail(nft: NFT, blockNumber: string) {
    showNotification('You will go to the detail in 2 seconds')
    const go = () =>
      this.$router.push({
        path: `/rmrk/detail/${getNftId(nft, blockNumber)}`,
        query: { message: 'congrats' },
      })
    setTimeout(go, 2000)
  }
}
</script>
