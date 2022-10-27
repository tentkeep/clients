import { PageSummary } from '../../index.js';
import { PageInfo, Place, ProductItem } from '../../index.js';
export declare type Gallery = {
    id?: number;
    title?: string;
    description?: string;
    createdBy?: number;
    tinyImage?: string;
    url?: string;
    image?: string;
    createdAt?: Date;
    modifiedAt?: Date;
};
export declare type GalleryEntryGenericTypes = 'shop' | 'music' | 'podcast' | 'page' | 'place' | 'video';
export declare type GalleryEntry = {
    id?: number;
    galleryId?: number;
    createdBy?: number;
    entryType?: GalleryEntryTypes;
    genericType?: GalleryEntryGenericTypes;
    sourceId?: string;
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    detail?: any;
    createdAt?: Date;
    modifiedAt?: Date;
};
export declare type GalleryEntrySummary = GalleryEntry & {
    items: GalleryEntryItem[];
};
export declare type GalleryEntryItem = {
    id?: number;
    galleryEntryId?: number;
    createdBy?: number;
    entryType: GalleryEntryTypes;
    genericType: GalleryEntryGenericTypes;
    sourceId: string;
    title: string;
    description?: string;
    image?: string;
    url: string;
    detail?: any;
    date?: Date;
    tags?: Record<string, GalleryEntryItemTagSource>;
    tokens?: string[];
    createdAt?: Date;
    modifiedAt?: Date;
};
export declare enum GalleryEntryItemTagSource {
    Source = "source",
    User = "user"
}
export declare type GalleryEntrySeedEtsy = {
    entryType: GalleryEntryTypes.Etsy;
    entry?: GalleryEntry;
    details?: {
        shopId: any;
    };
};
export declare type GalleryEntrySeedGooglePlace = {
    entryType: GalleryEntryTypes.GooglePlace;
    entry?: GalleryEntry;
    details?: {
        placeId: string;
    };
};
export declare type GalleryEntrySeedMusic = {
    entryType: GalleryEntryTypes.Music;
    entry?: GalleryEntry;
    details: {
        artistId: string;
    };
};
export declare type GalleryEntrySeedPodcast = {
    entryType: GalleryEntryTypes.Podcast;
    entry?: GalleryEntry;
    details: {
        feedUrl: string;
    };
};
export declare type GalleryEntrySeedShopify = {
    entryType: GalleryEntryTypes.Shopify;
    entry?: GalleryEntry;
    details: {
        shopUrl: string;
    };
};
export declare type GalleryEntrySeedWordpress = {
    entryType: GalleryEntryTypes.Wordpress;
    entry?: GalleryEntry;
    details: {
        url: string;
    };
};
export declare type GalleryEntrySeedYoutube = {
    entryType: GalleryEntryTypes.YouTube;
    entry?: GalleryEntry;
    details: {
        username?: string;
        channelId?: string;
    };
};
export declare type GalleryEntrySeed = GalleryEntrySeedEtsy | GalleryEntrySeedGooglePlace | GalleryEntrySeedMusic | GalleryEntrySeedPodcast | GalleryEntrySeedShopify | GalleryEntrySeedWordpress | GalleryEntrySeedYoutube;
export declare enum DataDomain {
    Christian = 1,
    Bootroots = 2
}
export declare enum GalleryEntryTypes {
    Etsy = "etsy",
    GooglePlace = "google.place",
    Music = "music",
    Podcast = "podcast",
    Shopify = "shopify",
    Wordpress = "wordpress",
    YouTube = "youtube"
}
export declare type GalleryUserRoles = 'member' | 'creator' | 'owner';
export declare type GalleryUser = {
    galleryId?: number;
    userId?: number;
    roles?: GalleryUserRoles[];
    domain?: number;
};
declare const _default: (dataDomain: DataDomain) => {
    authSignIn: (strategy: string) => void;
    authExchangeAccessCode: (code: any) => Promise<any>;
    getPageInfo: (url: string) => Promise<PageInfo>;
    getPageSummary: (url: string) => Promise<PageSummary>;
    getPlaces: (query: string) => Promise<Place[]>;
    getPlaceDetail: (sourceId: string) => Promise<Place>;
    getPodcastSummary: (feedUrl: string) => Promise<any>;
    getShopifyProductsSummary: (url: string, limit?: number) => Promise<ProductItem[]>;
    getWordpressPostsSummary: (url: string, limit?: number) => Promise<GalleryEntrySummary>;
    searchYoutubeChannels: (query: string, limit?: number) => Promise<any>;
    getGalleries: () => Promise<Gallery[]>;
    getGallery: (galleryId: number) => Promise<Gallery>;
    getRecentGalleryEntryItems: (genericType?: GalleryEntryGenericTypes | undefined) => Promise<GalleryEntryItem[]>;
    getTrendingGalleryEntryItemTopics: (limit?: number) => Promise<string[]>;
    getGalleriesForUser: (token: string) => Promise<any>;
    getGalleryImageUrl: (galleryId: number) => string;
    getGalleryEntries: (galleryId: number) => Promise<any>;
    getGalleryUserRole: (token: string, galleryId: number) => Promise<any>;
    saveGallery: (token: string, gallery: Gallery & {
        title: string;
    }) => Promise<Gallery>;
    saveGalleryImage: (token: string, galleryId: number, image: any) => Promise<any>;
    saveGalleryEntry: (token: string, galleryId: number, seed: GalleryEntrySeed) => Promise<GalleryEntry>;
    saveUserItemActivity: (token: string, itemActivity: any) => Promise<any>;
    searchEtsyShops: (query: string) => Promise<any>;
    searchMusicArtists: (query: string) => Promise<any>;
};
export default _default;
