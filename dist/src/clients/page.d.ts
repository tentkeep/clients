declare const _default: {
    info: (url: string) => Promise<PageInfo>;
    summary: (url: string) => Promise<PageSummary>;
};
export default _default;
export declare type PageSummary = {
    url: string;
    title: string;
    description?: string;
    image?: string;
    images?: string[];
    icon?: string;
    twitter?: string;
    elements?: {
        meta: any;
        links: any;
        title: any;
    };
};
declare type PageInfoFeatures = 'shopify' | 'wordpress';
export declare type PageInfo = {
    allowsIFrame: boolean;
    headers: Record<string, string>;
    features: PageInfoFeatures[];
};
