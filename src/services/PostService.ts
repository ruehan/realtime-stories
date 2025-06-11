interface PostMetadata {
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string;
  metaDescription?: string;
  keywords: string[];
}

interface PostContent {
  markdown: string;
  html?: string;
  readingTime?: number;
}

interface PostClassification {
  category: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  primaryLanguage?: string;
}

interface PostStats {
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
  status: 'draft' | 'published' | 'private';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  featured: boolean;
  allowComments: boolean;
  sortOrder?: number;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  limit?: number;
  offset: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  anchor: string;
}

export interface CodeBlock {
  language: string;
  code: string;
  line: number;
}

class PostService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:2567') {
    this.baseUrl = baseUrl;
  }

  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get posts with filtering and pagination
  async getPosts(params?: {
    status?: string;
    category?: string;
    tag?: string;
    featured?: boolean;
    authorId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/posts${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchAPI<PostsResponse>(endpoint);
  }

  // Get published posts (public endpoint)
  async getPublishedPosts(): Promise<Post[]> {
    return this.fetchAPI<Post[]>('/api/posts/published');
  }

  // Get featured posts
  async getFeaturedPosts(): Promise<Post[]> {
    return this.fetchAPI<Post[]>('/api/posts/featured');
  }

  // Get popular posts
  async getPopularPosts(limit?: number): Promise<Post[]> {
    const endpoint = `/api/posts/popular${limit ? `?limit=${limit}` : ''}`;
    return this.fetchAPI<Post[]>(endpoint);
  }

  // Get recent posts
  async getRecentPosts(limit?: number): Promise<Post[]> {
    const endpoint = `/api/posts/recent${limit ? `?limit=${limit}` : ''}`;
    return this.fetchAPI<Post[]>(endpoint);
  }

  // Get single post by ID
  async getPost(id: string): Promise<Post> {
    return this.fetchAPI<Post>(`/api/posts/${id}`);
  }

  // Get post by slug
  async getPostBySlug(slug: string): Promise<Post> {
    return this.fetchAPI<Post>(`/api/posts/slug/${slug}`);
  }

  // Get post table of contents
  async getPostTOC(id: string): Promise<TableOfContentsItem[]> {
    return this.fetchAPI<TableOfContentsItem[]>(`/api/posts/${id}/toc`);
  }

  // Get post code blocks
  async getPostCodeBlocks(id: string): Promise<CodeBlock[]> {
    return this.fetchAPI<CodeBlock[]>(`/api/posts/${id}/code-blocks`);
  }

  // Get related posts
  async getRelatedPosts(id: string, limit?: number): Promise<Post[]> {
    const endpoint = `/api/posts/${id}/related${limit ? `?limit=${limit}` : ''}`;
    return this.fetchAPI<Post[]>(endpoint);
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    return this.fetchAPI<string[]>('/api/categories');
  }

  // Get tags
  async getTags(): Promise<string[]> {
    return this.fetchAPI<string[]>('/api/tags');
  }

  // Get blog statistics
  async getStatistics(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    categoriesCount: number;
    tagsCount: number;
  }> {
    return this.fetchAPI('/api/stats');
  }

  // Create new post
  async createPost(postData: any): Promise<Post> {
    return this.fetchAPI<Post>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Update post
  async updatePost(id: string, postData: any): Promise<Post> {
    return this.fetchAPI<Post>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  // Delete post
  async deletePost(id: string): Promise<{ message: string }> {
    return this.fetchAPI<{ message: string }>(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const postService = new PostService();
export default PostService;