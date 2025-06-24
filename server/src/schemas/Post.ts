import { Schema, type } from '@colyseus/schema';

export class PostMetadata extends Schema {
  @type('string') title!: string;
  @type('string') slug!: string;
  @type('string') excerpt!: string;
  @type('string') thumbnail?: string;
  @type('string') metaDescription?: string;
  @type(['string']) keywords: string[] = [];
}

export class PostContent extends Schema {
  @type('string') markdown!: string;
  @type('string') html?: string; // 렌더링된 HTML (캐시용)
  @type('number') readingTime?: number; // 예상 읽기 시간 (분)
}

export class PostClassification extends Schema {
  @type('string') category!: string;
  @type(['string']) tags: string[] = [];
  @type('string') difficulty?: string; // 'beginner' | 'intermediate' | 'advanced'
  @type('string') primaryLanguage?: string; // 주요 프로그래밍 언어
}

export class PostStats extends Schema {
  @type('number') viewCount: number = 0;
  @type('number') likeCount: number = 0;
  @type('number') commentCount: number = 0;
  @type('number') shareCount: number = 0;
}

export class Post extends Schema {
  @type('string') id!: string;
  @type(PostMetadata) metadata!: PostMetadata;
  @type(PostContent) content!: PostContent;
  @type(PostClassification) classification!: PostClassification;
  @type(PostStats) stats = new PostStats();
  
  @type('string') authorId!: string;
  @type('string') authorName!: string;
  @type('string') status!: string; // 'draft' | 'published' | 'archived'
  
  @type('number') createdAt!: number;
  @type('number') updatedAt!: number;
  @type('number') publishedAt?: number;
  
  @type('boolean') featured: boolean = false;
  @type('boolean') allowComments: boolean = true;
  @type('number') sortOrder?: number;
}

// TypeScript 인터페이스도 함께 정의 (API용)
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
  status: 'draft' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  featured: boolean;
  allowComments: boolean;
  sortOrder?: number;
}

// 포스트 생성을 위한 입력 타입
export interface ICreatePostInput {
  metadata: Omit<IPostMetadata, 'slug'>; // slug는 서버에서 자동 생성
  content: Pick<IPostContent, 'markdown'>;
  classification: IPostClassification;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'private';
  featured?: boolean;
  allowComments?: boolean;
  sortOrder?: number;
}

// 포스트 업데이트를 위한 입력 타입
export interface IUpdatePostInput {
  metadata?: Partial<IPostMetadata>;
  content?: Partial<IPostContent>;
  classification?: Partial<IPostClassification>;
  status?: 'draft' | 'published' | 'private';
  featured?: boolean;
  allowComments?: boolean;
  sortOrder?: number;
}