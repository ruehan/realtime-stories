export interface PostMetadata {
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface PostContent {
  markdown: string;
  html?: string;
  readingTime?: number;
}

export interface PostClassification {
  category: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  primaryLanguage?: string;
}

export interface PostStats {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

export interface Post {
  id: string;
  metadata: PostMetadata;
  content: PostContent;
  classification: PostClassification;
  stats: PostStats;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  featured: boolean;
  allowComments: boolean;
  sortOrder?: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  limit?: number;
  offset: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:2567/api';

class PostServiceClient {
  private static instance: PostServiceClient;

  private constructor() {}

  static getInstance(): PostServiceClient {
    if (!PostServiceClient.instance) {
      PostServiceClient.instance = new PostServiceClient();
    }
    return PostServiceClient.instance;
  }

  private async fetchJSON<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getAllPosts(filters?: {
    status?: string;
    category?: string;
    tag?: string;
    featured?: boolean;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PostsResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/posts${queryString ? `?${queryString}` : ''}`;
    return this.fetchJSON(url);
  }

  // Alias for getAllPosts to match useInfiniteScroll expectation
  async getPosts(filters?: {
    status?: string;
    category?: string;
    tag?: string;
    featured?: boolean;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PostsResponse> {
    return this.getAllPosts(filters);
  }

  async getPublishedPosts(): Promise<Post[]> {
    return this.fetchJSON(`${API_BASE_URL}/posts/published`);
  }

  async getFeaturedPosts(): Promise<Post[]> {
    return this.fetchJSON(`${API_BASE_URL}/posts/featured`);
  }

  async getPopularPosts(limit: number = 10): Promise<Post[]> {
    return this.fetchJSON(`${API_BASE_URL}/posts/popular?limit=${limit}`);
  }

  async getRecentPosts(limit: number = 10): Promise<Post[]> {
    return this.fetchJSON(`${API_BASE_URL}/posts/recent?limit=${limit}`);
  }

  async getPost(id: string): Promise<Post> {
    return this.fetchJSON(`${API_BASE_URL}/posts/${id}`);
  }

  async getPostBySlug(slug: string): Promise<Post> {
    return this.fetchJSON(`${API_BASE_URL}/posts/slug/${slug}`);
  }

  async getPostTOC(id: string): Promise<TableOfContentsItem[]> {
    return this.fetchJSON(`${API_BASE_URL}/posts/${id}/toc`);
  }

  async getPostCodeBlocks(id: string): Promise<Array<{ language: string; code: string; line: number }>> {
    return this.fetchJSON(`${API_BASE_URL}/posts/${id}/code-blocks`);
  }

  async getRelatedPosts(id: string, limit: number = 5): Promise<Post[]> {
    return this.fetchJSON(`${API_BASE_URL}/posts/${id}/related?limit=${limit}`);
  }

  async getCategories(): Promise<string[]> {
    return this.fetchJSON(`${API_BASE_URL}/categories`);
  }

  async getTags(): Promise<string[]> {
    return this.fetchJSON(`${API_BASE_URL}/tags`);
  }

  async getStatistics(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    categoriesCount: number;
    tagsCount: number;
  }> {
    return this.fetchJSON(`${API_BASE_URL}/stats`);
  }
}

export const postService = PostServiceClient.getInstance();