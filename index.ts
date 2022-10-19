import etsy from './src/clients/etsy.js'
import google, { Place as _Place } from './src/clients/google.js'
import itunes from './src/clients/itunes.js'
import musickit from './src/clients/musickit.js'
import page, { PageSummary as _PageSummary } from './src/clients/page.js'
import rss from './src/clients/rss.js'
import shopify, { ProductItem as _ProductItem } from './src/clients/shopify.js'
import spotify from './src/clients/spotify.js'
import wordpress from './src/clients/wordpress.js'
import youtube from './src/clients/youtube.js'

export const clients = {
  etsy,
  google,
  itunes,
  musickit,
  page,
  rss,
  shopify,
  spotify,
  wordpress,
  youtube,
}

export default clients

export type Item = {
  sourceId: string
  title: string
  description?: string
  image?: string
  url?: string
  date?: Date
}

export type Summary = Item & {
  userId?: string
  items: Item[]
}

export type Place = _Place
export type PageSummary = _PageSummary
export type ProductItem = _ProductItem
