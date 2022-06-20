export type Offer = {
  id: string
  caller: string
  expiration: string
  price: string
}

export type OfferResponse<T = Offer> = {
  offers: T[]
  stats: {
    total: number
  }
}

export type CollectionOffer = Offer & {
  nft: {
    id: string
    name: string
  }
}
