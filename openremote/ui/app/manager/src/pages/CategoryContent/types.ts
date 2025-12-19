// TypeScript interfaces for Category Content feature

export interface DeviceTreeNode {
    id: string;
    name: string;
    type: 'province' | 'district' | 'ward' | 'device';
    children?: DeviceTreeNode[];
    parentId?: string;
}

export interface Category {
    id: string;
    name: string;
    note?: string;
    isShared: boolean;
    parentId?: string;
    areaId?: string;
    areaName?: string;
    createdBy?: string;
    createdAt?: string;
    children?: Category[];
    contents?: Content[];
}

export interface Content {
    id: string;
    name: string;
    note?: string;
    categoryId: string;
    categoryName?: string;
    fileUrl?: string;
    format?: string;
    size?: number;
    duration?: string;
    areaId?: string;
    areaName?: string;
    createdBy?: string;
    createdAt?: string;
}

export interface Playlist {
    id: string;
    name: string;
    note?: string;
    isShared: boolean;
    contentCount: number;
    areaId?: string;
    areaName?: string;
    createdBy?: string;
    createdAt?: string;
    contents?: PlaylistContent[];
}

export interface PlaylistContent {
    order: number;
    content: Content;
}

export type CategoryContentSubTab = 'category' | 'playlist';
