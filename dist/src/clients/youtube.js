import { GalleryEntryTypes, } from '@tentkeep/tentkeep';
import { api, ApiStatusError } from '../api.js';
import { forKey } from '../shareable/common.js';
const host = 'https://www.googleapis.com/youtube/v3';
const resources = [
    'activities',
    'channels',
    'comments',
    'playlists',
    'playlistItems',
    'search',
    'videos',
    'videoCategories',
];
const resourcesApi = resources.reduce((yt, resource) => {
    yt[resource] = (params = {}) => {
        const url = new URL(`${host}/${resource}`);
        forKey(params, (k) => url.searchParams.append(k, params[k]));
        return youtube(url);
    };
    return yt;
}, {});
const playlist = (playlistId, opts = {}) => resourcesApi.playlistItems({
    playlistId,
    part: 'snippet,contentDetails',
    maxResults: 50,
    ...opts,
});
const channelForUser = (username) => youtube(`${host}/channels?forUsername=${username}&part=snippet,contentDetails`);
const playlistsForChannel = (channelId) => youtube(`${host}/playlists?channelId=${channelId}&part=snippet,contentDetails,player&maxResults=50`);
const videosForPlaylist = (playlistId, opts = {}) => {
    return playlist(playlistId, opts)
        .then((pl) => ({
        nextPageToken: pl.nextPageToken,
        videoIds: pl.items.map((i) => i.snippet.resourceId.videoId),
    }))
        .then(async ({ nextPageToken, videoIds }) => {
        const videos = await resourcesApi.videos({
            id: videoIds.join(','),
            part: 'snippet,contentDetails,player,statistics,topicDetails',
        });
        return { videos, nextPageToken };
    });
};
const allVideosForPlaylist = async (playlistId) => {
    const firstPage = await playlist(playlistId);
    const videos = firstPage.items;
    let pageCount = 1;
    let nextPageToken = firstPage.nextPageToken;
    while (nextPageToken) {
        const page = await playlist(playlistId, { pageToken: nextPageToken });
        videos.push(...page.items);
        pageCount++;
        nextPageToken = page.nextPageToken;
    }
    console.log(`All videos fetched from ${pageCount} pages.`);
    return videos;
};
export default {
    ...resourcesApi,
    searchYouTube: resourcesApi.search,
    search: (query) => {
        return resourcesApi
            .search({
            part: 'snippet',
            maxResults: 25,
            q: query,
            type: 'channel',
        })
            .then((response) => response.items.map((item) => ({
            sourceId: item.snippet.channelId,
            entryType: GalleryEntryTypes.YouTube,
            genericType: 'video',
            title: item.snippet.title,
            description: item.snippet.description,
            url: `https://youtube.com/channel/${item.snippet.channelId}`,
            image: item.snippet.thumbnails.high.url,
        })));
    },
    summarize: async (channelId) => {
        const channelResponse = await resourcesApi.channels({
            id: channelId,
            part: 'snippet,contentDetails',
        });
        if (!channelResponse.items || channelResponse.items.length !== 1) {
            throw new Error('404');
        }
        const channel = channelResponse.items[0];
        const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
        const [uploadedVideos, playlists] = await Promise.all([
            allVideosForPlaylist(uploadsPlaylistId),
            playlistsForChannel(channel.id),
        ]);
        const img = channel.snippet.thumbnails.default;
        return {
            sourceId: channel.id,
            title: channel.snippet.title,
            image: img.url,
            url: `https://youtube.com/channel/${channel.id}`,
            items: uploadedVideos.map((i) => ({
                sourceId: i.id,
                entryType: GalleryEntryTypes.YouTube,
                genericType: 'video',
                title: i.snippet.title,
                description: i.snippet.description,
                images: [i.snippet.thumbnails.high.url],
                url: `https://youtube.com/video/${i.contentDetails.videoId}`,
                date: new Date(i.contentDetails.videoPublishedAt),
                videoId: i.contentDetails.videoId,
            })),
            publishedAt: channel.snippet.publishedAt,
            uploadsPlaylistId,
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
        };
    },
    channelForUser,
    playlistsForChannel,
    playlist,
    videosForPlaylist,
};
const youtube = (url, options) => {
    const apiKey = process.env.CLIENTS_GCP_KEY;
    if (!apiKey) {
        throw new ApiStatusError(500, 'missing internal api key');
    }
    const _url = url instanceof URL ? url : new URL(url);
    _url.searchParams.append('key', apiKey);
    return api(_url, options);
};
//# sourceMappingURL=youtube.js.map