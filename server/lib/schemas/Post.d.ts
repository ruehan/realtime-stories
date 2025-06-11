import { Schema } from '@colyseus/schema';
export declare class PostMetadata extends Schema {
    title: string;
    slug: string;
    excerpt: string;
    thumbnail?: string;
    metaDescription?: string;
    keywords: string[];
}
export declare class PostContent extends Schema {
    markdown: string;
    html?: string;
    readingTime?: number;
}
export declare class PostClassification extends Schema {
    category: string;
    tags: string[];
    difficulty?: string;
    primaryLanguage?: string;
}
export declare class PostStats extends Schema {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
}
export declare class Post extends Schema {
    id: string;
    metadata: PostMetadata;
    content: PostContent;
    classification: PostClassification;
    stats: PostStats;
    authorId: string;
    authorName: string;
    status: string;
    createdAt: number;
    updatedAt: number;
    publishedAt?: number;
    featured: boolean;
    allowComments: boolean;
    sortOrder?: number;
}
export interface IPostMetadata {
    title: string;
    slug: string;
    excerpt: string;
    thumbnail?: string;
    metaDescription?: string;
    keywords: string[];
}
export interface IPostContent {
    markdown: string;
    html?: string;
    readingTime?: number;
}
export interface IPostClassification {
    category: string;
    tags: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    primaryLanguage?: string;
}
export interface IPostStats {
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
}
export interface IPost {
    id: string;
    metadata: IPostMetadata;
    content: IPostContent;
    classification: IPostClassification;
    stats: IPostStats;
    authorId: string;
    authorName: string;
    status: 'draft' | 'published' | 'private';
    createdAt: number;
    updatedAt: number;
    publishedAt?: number;
    featured: boolean;
    allowComments: boolean;
    sortOrder?: number;
}
export interface ICreatePostInput {
    metadata: Omit<IPostMetadata, 'slug'>;
    content: Pick<IPostContent, 'markdown'>;
    classification: IPostClassification;
    authorId: string;
    authorName: string;
    status: 'draft' | 'published' | 'private';
    featured?: boolean;
    allowComments?: boolean;
    sortOrder?: number;
}
export interface IUpdatePostInput {
    metadata?: Partial<IPostMetadata>;
    content?: Partial<IPostContent>;
    classification?: Partial<IPostClassification>;
    status?: 'draft' | 'published' | 'private';
    featured?: boolean;
    allowComments?: boolean;
    sortOrder?: number;
}
