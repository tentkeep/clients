import { API, api, ApiStatusError } from '../api.js'
import { forKey } from '../shareable/common.js'
const host = 'https://www.googleapis.com/youtube/v3'

const resources = [
  'activities',
  'channels',
  'comments',
  'playlists',
  'playlistItems',
  'search',
  'videos',
  'videoCategories',
]

export type YoutubeResourceParams = any & { part: string; maxResults: number }
export type YoutubeResourceAPI = (params: YoutubeResourceParams) => Promise<any>

export interface YoutubeResources {
  activities: YoutubeResourceAPI
  channels: YoutubeResourceAPI
  comments: YoutubeResourceAPI
  playlists: YoutubeResourceAPI
  playlistItems: YoutubeResourceAPI
  search: YoutubeResourceAPI
  videos: YoutubeResourceAPI
  videoCategories: YoutubeResourceAPI
}

const resourcesApi: YoutubeResources = resources.reduce((yt, resource) => {
  yt[resource] = (params = {}) => {
    const url = new URL(`${host}/${resource}`)
    forKey(params, (k) => url.searchParams.append(k, params[k]))
    return youtube(url)
  }
  return yt
}, {} as YoutubeResources)

const playlist = (playlistId, opts = {}) =>
  resourcesApi.playlistItems({
    playlistId,
    part: 'snippet,contentDetails',
    maxResults: 50,
    ...opts,
  })
const channelForUser = (username) =>
  youtube(
    `${host}/channels?forUsername=${username}&part=snippet,contentDetails`,
  )
const playlistsForChannel = (channelId) =>
  youtube(
    `${host}/playlists?channelId=${channelId}&part=snippet,contentDetails,player&maxResults=50`,
  )

const videosForPlaylist = (playlistId, opts = {}) => {
  return playlist(playlistId, opts) // 1 x #pages
    .then((pl) => ({
      nextPageToken: pl.nextPageToken,
      videoIds: pl.items.map((i) => i.snippet.resourceId.videoId),
    }))
    .then(async ({ nextPageToken, videoIds }) => {
      const videos = await resourcesApi.videos({
        id: videoIds.join(','),
        part: 'snippet,contentDetails,player,statistics,topicDetails',
      })
      return { videos, nextPageToken }
    }) // 1 x #pages
}
const allVideosForPlaylist = async (playlistId) => {
  const first = await playlist(playlistId)
  const videos = first.items
  let pageCount = 1
  let nextPageToken = first.nextPageToken
  while (nextPageToken) {
    const page = await playlist(playlistId, { pageToken: nextPageToken })
    videos.push(...page.items)
    pageCount++
    nextPageToken = page.nextPageToken
  }
  console.log(`All videos fetched from ${pageCount} pages.`)
  return videos
}

export default {
  ...resourcesApi,
  channelSummary: async ({ username, channelId }) => {
    let channelResponse
    if (username) {
      channelResponse = await channelForUser(username)
    } else {
      channelResponse = await resourcesApi.channels({
        id: channelId,
        part: 'snippet,contentDetails',
      })
    }
    if (!channelResponse.items || channelResponse.items.length !== 1) {
      throw new Error('404')
    }
    const channel = channelResponse.items[0]
    const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads
    const [uploadedVideos, playlists] = await Promise.all([
      allVideosForPlaylist(uploadsPlaylistId),
      playlistsForChannel(channel.id),
    ])
    const img = channel.snippet.thumbnails.default

    return {
      sourceId: channel.id,
      title: channel.snippet.title,
      image: img.url,
      publishedAt: channel.snippet.publishedAt,
      uploadsPlaylistId,
      items: uploadedVideos.map((i) => ({
        sourceId: i.id,
        title: i.snippet.title,
        description: i.snippet.description,
        image: i.snippet.thumbnails.high.url,
        date: new Date(i.contentDetails.videoPublishedAt).toISOString(),
        videoId: i.contentDetails.videoId,
        // kind: i.kind,
        // channelId: i.snippet.channelId,
        // channelTitle: i.snippet.channelTitle,
        // duration: i.contentDetails.duration, // requires video fetch
        // definition: i.contentDetails.definition, // requires video fetch
        // tags: (i.snippet.tags || []).join('||'), // requires video fetch
        // views: i.statistics.viewCount, // requires video fetch
        // likes: i.statistics.likeCount, // requires video fetch
        // dislikes: i.statistics.dislikeCount // requires video fetch
      })),
      imageWidth: img.width,
      imageHeight: img.height,
      playlists: playlists.items.map((p) => ({
        sourceId: p.id,
        title: p.snippet.title,
        description: p.snippet.description,
        image: p.snippet.thumbnails.high.url,
        publishedAt: p.snippet.publishedAt,
        itemCount: p.contentDetails.itemCount,
      })),
    }
  },
  channelForUser,
  playlistsForChannel,
  playlist,
  videosForPlaylist,
}

const youtube: API = (url, options) => {
  const apiKey = process.env.CLIENTS_GCP_KEY
  if (!apiKey) {
    throw new ApiStatusError(500, 'missing internal api key')
  }
  const _url = url instanceof URL ? url : new URL(url)
  _url.searchParams.append('key', apiKey)
  return api(_url, options)
}
