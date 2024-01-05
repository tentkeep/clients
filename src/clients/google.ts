import { GalleryEntryPlace } from '@tentkeep/tentkeep'
import api, { ApiStatusError } from '../api.js'
import { TentkeepClient } from './tentkeep-client.js'

const searchFields =
  'place_id,formatted_address,name,rating,opening_hours,geometry,types'

const raw = {
  places: {
    searchOld: (query: string): Promise<OldGooglePlace> =>
      google(
        `/findplacefromtext/json?fields=${searchFields}&input=${query}&inputtype=textquery`,
      ),

    search: (query: string): Promise<PlaceTextSearchResponse> => {
      if (!process.env.CLIENTS_GCP_KEY) throw new Error('Missing API Key')
      return api('https://places.googleapis.com/v1/places:searchText', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.CLIENTS_GCP_KEY,
          'X-Goog-FieldMask':
            'places.id,places.name,places.addressComponents,places.displayName,places.formattedAddress,places.location,places.primaryType',
        },
        body: {
          textQuery: query,
        },
      })
    },
    details: (placeId: string): Promise<{ result: OldGooglePlace }> =>
      google(`/details/json?place_id=${placeId}`),
  },
}

async function search(query: string): Promise<GalleryEntryPlace[]> {
  const result = await raw.places.search(query)
  return result.places?.map(mapPlaceTextSearch) ?? []
}

async function placeDetails(placeId: string): Promise<GalleryEntryPlace> {
  return mapPlace((await raw.places.details(placeId)).result)
}

const contentClient = {
  search,
  summarize: (sourceId: string) => {
    return placeDetails(sourceId).then((place: any) => {
      place.items = []
      return place
    })
  },
} as TentkeepClient

export default {
  ...contentClient,
  raw,
  placeDetails,
}

type GooglePlaceTypes =
  | 'street_number'
  | 'route'
  | 'locality'
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'administrative_area_level_3'
  | 'country'
  | 'postal_code'
  | 'political'

type PlaceTextSearchResponse = { places?: GooglePlace[] }

function google(path: string) {
  const url = new URL(`https://maps.googleapis.com/maps/api/place${path}`)
  url.searchParams.append('key', process.env.CLIENTS_GCP_KEY ?? '')
  return api(url)
}

function mapPlace(place: OldGooglePlace): GalleryEntryPlace {
  if (!place.place_id || !place.name) {
    throw new ApiStatusError(412, 'Missing sourceId or title')
  }

  function findComponent(type: GooglePlaceTypes) {
    return (
      place.address_components?.find((c) => c.types.includes(type))
        ?.short_name ?? ''
    )
  }

  return {
    sourceId: place.place_id!,
    title: place.name!,
    url: place.website,
    detail: {
      address: place.formatted_address,
      streetNumber: findComponent('street_number'),
      street: findComponent('route'),
      city: findComponent('locality'),
      county: findComponent('administrative_area_level_2'),
      province: findComponent('administrative_area_level_1'),
      country: findComponent('country'),
      postalCode: findComponent('postal_code'),
      phone: place.international_phone_number,
      latitude: place.geometry?.location?.lat as unknown as number,
      longitude: place.geometry?.location?.lng as unknown as number,
    },
  } as GalleryEntryPlace
}

function mapPlaceTextSearch(place: GooglePlace): GalleryEntryPlace {
  if (!place.id || !place.displayName?.text) {
    throw new ApiStatusError(412, 'Missing sourceId or title')
  }

  function findComponent(type: GooglePlaceTypes) {
    return (
      place.addressComponents?.find((c) => c.types.includes(type))?.longText ??
      ''
    )
  }

  return {
    sourceId: place.id!,
    title: place.displayName?.text!,
    url: place.websiteUri,
    detail: {
      address: place.formattedAddress,
      streetNumber: findComponent('street_number'),
      street: findComponent('route'),
      city: findComponent('locality'),
      county: findComponent('administrative_area_level_2'),
      province: findComponent('administrative_area_level_1'),
      country: findComponent('country'),
      postalCode: findComponent('postal_code'),
      phone: place.internationalPhoneNumber,
      latitude: place.location?.latitude as unknown as number,
      longitude: place.location?.longitude as unknown as number,
    },
  } as GalleryEntryPlace
}

export type GooglePlace = {
  name: string
  id: string
  types?: string[]
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  formattedAddress?: string
  addressComponents?: {
    longText: string
    shortText: string
    types: string[]
    languageCode: string
  }[]
  plusCode?: {
    globalCode?: string
    compoundCode?: string
  }
  location?: {
    latitude?: number
    longitude?: number
  }
  viewport?: {
    low: {
      latitude: number
      longitude: number
    }
    high: {
      latitude: number
      longitude: number
    }
  }
  rating?: number
  googleMapsUri?: string
  websiteUri?: string
  regularOpeningHours?: {
    openNow: boolean
    periods: {
      open: {
        day: number
        hour: number
        minute: number
      }
      close: {
        day: number
        hour: number
        minute: number
      }
    }[]
    weekdayDescriptions?: string[]
  }
  utcOffsetMinutes?: number
  adrFormatAddress?: string
  businessStatus?: string
  userRatingCount?: number
  iconMaskBaseUri?: string
  iconBackgroundColor?: string
  displayName?: {
    text: string
    languageCode: string
  }
  primaryTypeDisplayName?: {
    text: string
    languageCode: string
  }
  currentOpeningHours?: {
    openNow: boolean
    periods: {
      open: {
        day: number
        hour: number
        minute: number
        date: {
          year: number
          month: number
          day: number
        }
      }
      close: {
        day: number
        hour: number
        minute: number
        date: {
          year: number
          month: number
          day: number
        }
      }
    }[]
    weekdayDescriptions: string[]
  }
  primaryType?: string
  shortFormattedAddress?: string
  reviews?: {
    name: string
    relativePublishTimeDescription: string
    rating: 5
    text: {
      text: string
      languageCode: string
    }
    originalText: {
      text: string
      languageCode: string
    }
    authorAttribution: {
      displayName: string
      uri: string
      photoUri: string
    }
    publishTime: Date
  }[]
  photos?: {
    name: string
    widthPx: number
    heightPx: number
    authorAttributions: [
      {
        displayName: string
        uri: string
        photoUri: string
      },
    ]
  }[]
  accessibilityOptions?: {
    wheelchairAccessibleParking: boolean
  }
}

type OldGooglePlace = {
  address_components: {
    long_name: string
    short_name: string
    types: GooglePlaceTypes[]
  }[]
  place_id: string
  name: string
  website?: string
  formatted_address: string
  international_phone_number?: string
  geometry?: {
    location?: {
      lat: number
      lng: number
    }
  }
}
