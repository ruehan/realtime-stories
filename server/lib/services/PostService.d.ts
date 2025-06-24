import { IPost, ICreatePostInput, IUpdatePostInput } from '../schemas/Post';
export declare class PostService {
    private static instance;
    private postsDirectory;
    private fileExtension;
    private posts;
    private initialized;
    private markdownService;
    private constructor();
    static getInstance(): PostService;
    private generateSlug;
    private generateId;
    private calculateReadingTime;
    initialize(): Promise<void>;
    private loadPostsFromFiles;
    private createPostFromFrontmatter;
    private generateIdFromFilename;
    createPost(input: ICreatePostInput): Promise<IPost>;
    updatePost(id: string, input: IUpdatePostInput): Promise<IPost | null>;
    getPost(id: string): Promise<IPost | null>;
    getPostBySlug(slug: string): Promise<IPost | null>;
    deletePost(id: string): Promise<boolean>;
    getAllPosts(filters?: {
        status?: string;
        category?: string;
        tag?: string;
        featured?: boolean;
        authorId?: string;
    }): Promise<IPost[]>;
    getPublishedPosts(): Promise<IPost[]>;
    getFeaturedPosts(): Promise<IPost[]>;
    incrementViewCount(id: string): Promise<void>;
    getCategories(): Promise<string[]>;
    getTags(): Promise<string[]>;
    searchPosts(query: string, filters?: {
        status?: string;
        category?: string;
        tag?: string;
    }): Promise<IPost[]>;
    getPostTOC(id: string): Promise<Array<{
        id: string;
        title: string;
        level: number;
        anchor: string;
    }> | null>;
    getPostCodeBlocks(id: string): Promise<Array<{
        language: string;
        code: string;
        line: number;
    }> | null>;
    getRelatedPosts(id: string, limit?: number): Promise<IPost[]>;
    getPopularPosts(limit?: number): Promise<IPost[]>;
    getRecentPosts(limit?: number): Promise<IPost[]>;
    getStatistics(): Promise<{
        totalPosts: number;
        publishedPosts: number;
        draftPosts: number;
        totalViews: number;
        totalLikes: number;
        categoriesCount: number;
        tagsCount: number;
    }>;
    migrateFromJsonToMarkdown(): Promise<void>;
}
