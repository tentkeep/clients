import api, { sanitizeOptions } from '../api.js';
const TENTKEEP_HOST = 'https://api.tentkeep.com/v1';
export var DataDomain;
(function (DataDomain) {
    DataDomain[DataDomain["Christian"] = 1] = "Christian";
    DataDomain[DataDomain["Bootroots"] = 2] = "Bootroots";
})(DataDomain = DataDomain || (DataDomain = {}));
export default (dataDomain) => {
    const tentkeep = (path, options) => {
        const _options = sanitizeOptions(options);
        _options.headers = _options.headers ?? {};
        _options.headers.key = new Date().toISOString().substring(0, 10);
        _options.headers['x-data-domain'] = dataDomain;
        const url = new URL(`https://api.tentkeep.com/v1${path}`);
        return api(url, _options);
    };
    return {
        exchangeAccessCode: (code) => {
            const options = {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: {
                    grant_type: 'authorization_code',
                    code,
                },
            };
            return tentkeep(`/auth/token`, options);
        },
        getPodcastSummary: (feedUrl) => tentkeep(`/proxy/rss/podcast-summary?feed=${feedUrl}`),
        getGalleries: () => tentkeep(`/galleries`),
        getGallery: (galleryId) => tentkeep(`/galleries/${galleryId}`),
        getRecentlyAddedGalleryEntryItems: () => tentkeep(`/gallery-entry-items/recent`),
        getGalleriesForUser: (token) => tentkeep(`/me/galleries`, { headers: authHeaders(token) }),
        getGalleryImageUrl: (galleryId) => `${TENTKEEP_HOST}/galleries/${galleryId}/image`,
        getGalleryEntries: (galleryId) => tentkeep(`/galleries/${galleryId}/entries`),
        getGalleryUserRole: (token, galleryId) => tentkeep(`/me/galleries/${galleryId}`, {
            headers: authHeaders(token),
        }),
        saveGallery: (token, gallery) => tentkeep(`/galleries`, {
            method: 'post',
            headers: postHeaders(token),
            body: gallery,
        }),
        saveGalleryImage: async (token, galleryId, image) => {
            const body = {
                galleryId: galleryId,
                name: 'gallery-image',
                contentType: 'image/*',
            };
            const mediaPrepare = await tentkeep(`/content/prepare`, {
                method: 'post',
                headers: postHeaders(token),
                body,
            });
            const signedPutRequest = JSON.parse(Buffer.from(mediaPrepare.id, 'hex').toString('utf-8'));
            return api(signedPutRequest.url, {
                ...signedPutRequest.options,
                body: image,
            });
        },
        saveGalleryEntry: (token, galleryId, seed) => tentkeep(`/galleries/${galleryId}/entries`, {
            method: 'post',
            headers: postHeaders(token),
            body: seed,
        }),
        saveUserItemActivity: (token, itemActivity) => tentkeep(`/me/activity/item`, {
            method: 'post',
            headers: postHeaders(token),
            body: itemActivity,
        }),
        searchEtsyShops: (query) => tentkeep(`/proxy/etsy/shops?q=${query}`),
        searchMusicArtists: (query) => tentkeep(`/proxy/music/artists?q=${query}`),
    };
};
const authHeaders = (token) => ({
    Authorization: `Bearer ${token}`,
});
const postHeaders = (token) => ({
    ...authHeaders(token),
    'Content-Type': 'application/json',
});
//# sourceMappingURL=tentkeep.js.map