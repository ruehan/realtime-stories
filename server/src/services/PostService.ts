import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Post, PostMetadata, PostContent, PostClassification, PostStats, IPost, ICreatePostInput, IUpdatePostInput } from '../schemas/Post';
import { MarkdownService } from './MarkdownService';

export class PostService {
  private static instance: PostService;
  private postsDirectory = path.join(__dirname, '../../data/posts');
  private fileExtension = '.md';
  private posts: Map<string, IPost> = new Map();
  private initialized = false;
  private markdownService = MarkdownService.getInstance();

  private constructor() {}

  static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private generateId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateReadingTime(markdown: string): number {
    // 평균 읽기 속도: 분당 200단어
    const wordsPerMinute = 200;
    const words = markdown.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.initialized = true; // 먼저 플래그를 설정하여 중복 초기화 방지
    
    console.log('🔧 Initializing PostService...');
    console.log('📁 Posts directory:', this.postsDirectory);

    try {
      // posts 디렉터리가 존재하는지 확인
      await fs.access(this.postsDirectory);
      console.log('✅ Posts directory exists');
    } catch {
      // posts 디렉터리가 없으면 생성
      try {
        await fs.mkdir(this.postsDirectory, { recursive: true });
        console.log('📁 Created posts directory');
      } catch (error) {
        console.error('❌ Failed to create posts directory:', error);
        throw error;
      }
    }

    try {
      // 먼저 JSON에서 마크다운으로 마이그레이션 시도
      await this.migrateFromJsonToMarkdown();
      
      // 마크다운 파일들을 읽어서 로드
      await this.loadPostsFromFiles();
      
      console.log(`✅ PostService initialized with ${this.posts.size} posts`);
      console.log('📋 Loaded posts:', Array.from(this.posts.values()).map(p => ({
        id: p.id,
        title: p.metadata.title,
        status: p.status
      })));
    } catch (error) {
      console.log('📝 Error loading posts:', error);
      
      // 빈 posts Map으로 초기화
      this.posts.clear();
    }
  }

  private async loadPostsFromFiles(): Promise<void> {
    try {
      console.log('📁 Loading posts from directory:', this.postsDirectory);
      const files = await fs.readdir(this.postsDirectory);
      console.log('📁 Files found:', files);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      console.log('📁 Markdown files:', markdownFiles);
      
      this.posts.clear();
      
      for (const filename of markdownFiles) {
        try {
          const filepath = path.join(this.postsDirectory, filename);
          console.log(`📄 Loading file: ${filename}`);
          const fileContent = await fs.readFile(filepath, 'utf8');
          const { data: frontmatter, content: markdown } = matter(fileContent);
          console.log(`📄 Frontmatter for ${filename}:`, frontmatter);
          
          // frontmatter에서 데이터 추출
          const post = await this.createPostFromFrontmatter(filename, frontmatter, markdown);
          console.log(`✅ Loaded post: ${post.metadata.title} (status: ${post.status})`);
          this.posts.set(post.id, post);
        } catch (error) {
          console.error(`❌ Error loading post file ${filename}:`, error);
        }
      }
      console.log(`📊 Total posts loaded: ${this.posts.size}`);
    } catch (error) {
      console.error('❌ Error reading posts directory:', error);
      throw error;
    }
  }

  private async createPostFromFrontmatter(filename: string, frontmatter: any, markdown: string): Promise<IPost> {
    // 마크다운 렌더링
    const markdownResult = this.markdownService.render(markdown, {
      enableCodeHighlighting: true,
      sanitize: true,
      generateTOC: true
    });

    // frontmatter에서 날짜 파싱
    const createdAt = frontmatter.createdAt ? new Date(frontmatter.createdAt).getTime() : Date.now();
    const updatedAt = frontmatter.updatedAt ? new Date(frontmatter.updatedAt).getTime() : createdAt;
    const publishedAt = frontmatter.publishedAt ? new Date(frontmatter.publishedAt).getTime() : undefined;

    const post: IPost = {
      id: this.generateIdFromFilename(filename),
      metadata: {
        title: frontmatter.title || 'Untitled',
        slug: frontmatter.slug || this.generateSlug(frontmatter.title || 'untitled'),
        excerpt: frontmatter.excerpt || '',
        thumbnail: frontmatter.thumbnail,
        metaDescription: frontmatter.metaDescription,
        keywords: frontmatter.keywords || []
      },
      content: {
        markdown,
        html: markdownResult.html,
        readingTime: frontmatter.readingTime || markdownResult.readingTime
      },
      classification: {
        category: frontmatter.category || 'Uncategorized',
        tags: frontmatter.tags || [],
        difficulty: frontmatter.difficulty,
        primaryLanguage: frontmatter.primaryLanguage
      },
      stats: {
        viewCount: 0, // 파일에서는 0으로 시작
        likeCount: 0,
        commentCount: 0,
        shareCount: 0
      },
      authorId: frontmatter.authorId || 'unknown',
      authorName: frontmatter.authorName || 'Unknown Author',
      status: frontmatter.status || 'draft',
      createdAt,
      updatedAt,
      publishedAt,
      featured: frontmatter.featured || false,
      allowComments: frontmatter.allowComments !== false,
      sortOrder: frontmatter.sortOrder
    };

    return post;
  }

  private generateIdFromFilename(filename: string): string {
    // 파일명에서 확장자 제거하고 ID로 사용
    return filename.replace('.md', '').replace(/[^a-zA-Z0-9-_]/g, '-');
  }


  async createPost(input: ICreatePostInput): Promise<IPost> {
    await this.initialize();

    const slug = this.generateSlug(input.metadata.title);
    const filename = `${slug}.md`;
    const filepath = path.join(this.postsDirectory, filename);
    const now = Date.now();

    // frontmatter 생성
    const frontmatter = {
      title: input.metadata.title,
      slug,
      excerpt: input.metadata.excerpt || '',
      thumbnail: input.metadata.thumbnail,
      metaDescription: input.metadata.metaDescription,
      keywords: input.metadata.keywords || [],
      category: input.classification.category,
      tags: input.classification.tags || [],
      difficulty: input.classification.difficulty,
      primaryLanguage: input.classification.primaryLanguage,
      authorId: input.authorId,
      authorName: input.authorName,
      status: input.status,
      featured: input.featured || false,
      allowComments: input.allowComments !== false,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      publishedAt: input.status === 'published' ? new Date(now).toISOString() : undefined,
      readingTime: this.calculateReadingTime(input.content.markdown),
      sortOrder: input.sortOrder
    };

    // 마크다운 파일 내용 생성
    const fileContent = matter.stringify(input.content.markdown, frontmatter);

    // 파일 저장
    await fs.writeFile(filepath, fileContent, 'utf8');

    // 메모리에 로드
    const post = await this.createPostFromFrontmatter(filename, frontmatter, input.content.markdown);
    this.posts.set(post.id, post);

    return post;
  }

  async updatePost(id: string, input: IUpdatePostInput): Promise<IPost | null> {
    await this.initialize();

    const existingPost = this.posts.get(id);
    if (!existingPost) return null;

    // 기존 파일 경로 찾기
    const oldFilename = `${id}.md`;
    const oldFilepath = path.join(this.postsDirectory, oldFilename);

    try {
      // 기존 파일 읽기
      const fileContent = await fs.readFile(oldFilepath, 'utf8');
      const { data: frontmatter, content: markdown } = matter(fileContent);

      const now = Date.now();
      let newSlug = existingPost.metadata.slug;
      let newMarkdown = markdown;

      // frontmatter 업데이트
      const updatedFrontmatter = { ...frontmatter };
      updatedFrontmatter.updatedAt = new Date(now).toISOString();

      if (input.metadata) {
        if (input.metadata.title) {
          updatedFrontmatter.title = input.metadata.title;
          newSlug = this.generateSlug(input.metadata.title);
          updatedFrontmatter.slug = newSlug;
        }
        if (input.metadata.excerpt !== undefined) updatedFrontmatter.excerpt = input.metadata.excerpt;
        if (input.metadata.thumbnail !== undefined) updatedFrontmatter.thumbnail = input.metadata.thumbnail;
        if (input.metadata.metaDescription !== undefined) updatedFrontmatter.metaDescription = input.metadata.metaDescription;
        if (input.metadata.keywords !== undefined) updatedFrontmatter.keywords = input.metadata.keywords;
      }

      if (input.content?.markdown) {
        newMarkdown = input.content.markdown;
        updatedFrontmatter.readingTime = this.calculateReadingTime(newMarkdown);
      }

      if (input.classification) {
        if (input.classification.category !== undefined) updatedFrontmatter.category = input.classification.category;
        if (input.classification.tags !== undefined) updatedFrontmatter.tags = input.classification.tags;
        if (input.classification.difficulty !== undefined) updatedFrontmatter.difficulty = input.classification.difficulty;
        if (input.classification.primaryLanguage !== undefined) updatedFrontmatter.primaryLanguage = input.classification.primaryLanguage;
      }

      if (input.status !== undefined) {
        updatedFrontmatter.status = input.status;
        if (input.status === 'published' && !frontmatter.publishedAt) {
          updatedFrontmatter.publishedAt = new Date(now).toISOString();
        }
      }

      if (input.featured !== undefined) updatedFrontmatter.featured = input.featured;
      if (input.allowComments !== undefined) updatedFrontmatter.allowComments = input.allowComments;
      if (input.sortOrder !== undefined) updatedFrontmatter.sortOrder = input.sortOrder;

      // 새 파일 내용 생성
      const newFileContent = matter.stringify(newMarkdown, updatedFrontmatter);
      const newFilename = `${newSlug}.md`;
      const newFilepath = path.join(this.postsDirectory, newFilename);

      // 파일명이 변경된 경우 기존 파일 삭제
      if (newFilename !== oldFilename) {
        await fs.unlink(oldFilepath);
      }

      // 새 파일 저장
      await fs.writeFile(newFilepath, newFileContent, 'utf8');

      // 메모리에서 업데이트
      const updatedPost = await this.createPostFromFrontmatter(newFilename, updatedFrontmatter, newMarkdown);
      this.posts.delete(id);
      this.posts.set(updatedPost.id, updatedPost);

      return updatedPost;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      return null;
    }
  }

  async getPost(id: string): Promise<IPost | null> {
    await this.initialize();
    return this.posts.get(id) || null;
  }

  async getPostBySlug(slug: string): Promise<IPost | null> {
    await this.initialize();
    for (const post of this.posts.values()) {
      if (post.metadata.slug === slug) {
        return post;
      }
    }
    return null;
  }

  async deletePost(id: string): Promise<boolean> {
    await this.initialize();
    
    const post = this.posts.get(id);
    if (!post) return false;

    try {
      // 파일 삭제
      const filename = `${id}.md`;
      const filepath = path.join(this.postsDirectory, filename);
      await fs.unlink(filepath);

      // 메모리에서 삭제
      this.posts.delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      return false;
    }
  }

  async getAllPosts(filters?: {
    status?: string;
    category?: string;
    tag?: string;
    featured?: boolean;
    authorId?: string;
  }): Promise<IPost[]> {
    await this.initialize();
    
    console.log('📊 getAllPosts called with filters:', filters);
    console.log('📊 Total posts in memory:', this.posts.size);
    
    let posts = Array.from(this.posts.values());

    if (filters) {
      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
        console.log(`📊 After status filter (${filters.status}):`, posts.length);
      }
      if (filters.category) {
        posts = posts.filter(post => post.classification.category === filters.category);
        console.log(`📊 After category filter (${filters.category}):`, posts.length);
      }
      if (filters.tag) {
        posts = posts.filter(post => post.classification.tags.includes(filters.tag!));
        console.log(`📊 After tag filter (${filters.tag}):`, posts.length);
      }
      if (filters.featured !== undefined) {
        posts = posts.filter(post => post.featured === filters.featured);
        console.log(`📊 After featured filter (${filters.featured}):`, posts.length);
      }
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
        console.log(`📊 After authorId filter (${filters.authorId}):`, posts.length);
      }
    }

    // 기본적으로 최신순으로 정렬
    const sortedPosts = posts.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return a.sortOrder - b.sortOrder;
      }
      return b.createdAt - a.createdAt;
    });
    
    console.log('📊 Final posts count:', sortedPosts.length);
    console.log('📊 Post titles:', sortedPosts.map(p => p.metadata.title));
    
    return sortedPosts;
  }

  async getPublishedPosts(): Promise<IPost[]> {
    return this.getAllPosts({ status: 'published' });
  }

  async getFeaturedPosts(): Promise<IPost[]> {
    return this.getAllPosts({ status: 'published', featured: true });
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.initialize();
    const post = this.posts.get(id);
    if (post) {
      post.stats.viewCount++;
      // Note: View counts are only maintained in memory for file-based storage
      // Consider implementing a separate analytics storage solution for persistent stats
    }
  }

  async getCategories(): Promise<string[]> {
    await this.initialize();
    const categories = new Set<string>();
    for (const post of this.posts.values()) {
      if (post.status === 'published') {
        categories.add(post.classification.category);
      }
    }
    return Array.from(categories).sort();
  }

  async getTags(): Promise<string[]> {
    await this.initialize();
    const tags = new Set<string>();
    for (const post of this.posts.values()) {
      if (post.status === 'published') {
        post.classification.tags.forEach(tag => tags.add(tag));
      }
    }
    return Array.from(tags).sort();
  }

  // 포스트 검색 기능
  async searchPosts(query: string, filters?: {
    status?: string;
    category?: string;
    tag?: string;
  }): Promise<IPost[]> {
    await this.initialize();
    
    let posts = await this.getAllPosts(filters);
    
    if (!query.trim()) {
      return posts;
    }

    const searchTerm = query.toLowerCase();
    
    return posts.filter(post => {
      // 제목에서 검색
      const titleMatch = post.metadata.title.toLowerCase().includes(searchTerm);
      
      // 요약에서 검색
      const excerptMatch = post.metadata.excerpt.toLowerCase().includes(searchTerm);
      
      // 태그에서 검색
      const tagMatch = post.classification.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      );
      
      // 카테고리에서 검색
      const categoryMatch = post.classification.category.toLowerCase().includes(searchTerm);
      
      // 마크다운 내용에서 검색 (코드 블록 제외)
      const contentWithoutCode = post.content.markdown.replace(/```[\s\S]*?```/g, '');
      const contentMatch = contentWithoutCode.toLowerCase().includes(searchTerm);
      
      return titleMatch || excerptMatch || tagMatch || categoryMatch || contentMatch;
    });
  }

  // 포스트의 목차 생성
  async getPostTOC(id: string): Promise<Array<{ id: string; title: string; level: number; anchor: string }> | null> {
    await this.initialize();
    const post = this.posts.get(id);
    if (!post) return null;

    const result = this.markdownService.render(post.content.markdown, {
      generateTOC: true,
      enableCodeHighlighting: false,
      sanitize: false
    });

    return result.toc || [];
  }

  // 포스트의 코드 블록 추출
  async getPostCodeBlocks(id: string): Promise<Array<{ language: string; code: string; line: number }> | null> {
    await this.initialize();
    const post = this.posts.get(id);
    if (!post) return null;

    return this.markdownService.extractCodeBlocks(post.content.markdown);
  }

  // 관련 포스트 추천 (태그 기반)
  async getRelatedPosts(id: string, limit: number = 5): Promise<IPost[]> {
    await this.initialize();
    const post = this.posts.get(id);
    if (!post) return [];

    const publishedPosts = await this.getPublishedPosts();
    const relatedPosts = publishedPosts
      .filter(p => p.id !== id)
      .map(p => {
        // 공통 태그 수 계산
        const commonTags = p.classification.tags.filter(tag => 
          post.classification.tags.includes(tag)
        ).length;
        
        // 같은 카테고리인지 확인
        const sameCategory = p.classification.category === post.classification.category;
        
        // 점수 계산
        const score = commonTags * 2 + (sameCategory ? 1 : 0);
        
        return { post: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);

    return relatedPosts;
  }

  // 인기 포스트 (조회수 기준)
  async getPopularPosts(limit: number = 10): Promise<IPost[]> {
    const publishedPosts = await this.getPublishedPosts();
    return publishedPosts
      .sort((a, b) => b.stats.viewCount - a.stats.viewCount)
      .slice(0, limit);
  }

  // 최근 포스트
  async getRecentPosts(limit: number = 10): Promise<IPost[]> {
    const publishedPosts = await this.getPublishedPosts();
    return publishedPosts
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
      .slice(0, limit);
  }

  // 통계 정보
  async getStatistics(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    totalLikes: number;
    categoriesCount: number;
    tagsCount: number;
  }> {
    await this.initialize();
    
    const allPosts = Array.from(this.posts.values());
    const publishedPosts = allPosts.filter(p => p.status === 'published');
    const draftPosts = allPosts.filter(p => p.status === 'draft');
    
    const totalViews = allPosts.reduce((sum, post) => sum + post.stats.viewCount, 0);
    const totalLikes = allPosts.reduce((sum, post) => sum + post.stats.likeCount, 0);
    
    const categories = await this.getCategories();
    const tags = await this.getTags();

    return {
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews,
      totalLikes,
      categoriesCount: categories.length,
      tagsCount: tags.length
    };
  }

  // 기존 JSON 파일을 마크다운 파일로 마이그레이션
  async migrateFromJsonToMarkdown(): Promise<void> {
    const jsonPath = path.join(__dirname, '../../data/posts.json');
    
    try {
      // JSON 파일이 있는지 확인
      await fs.access(jsonPath);
      
      // JSON 파일 읽기
      const jsonContent = await fs.readFile(jsonPath, 'utf8');
      const posts = JSON.parse(jsonContent);
      
      console.log(`📁 Found ${posts.length} posts in JSON file, migrating to markdown files...`);
      
      for (const post of posts) {
        const filename = `${post.metadata.slug}.md`;
        const filepath = path.join(this.postsDirectory, filename);
        
        // 파일이 이미 존재하는지 확인
        try {
          await fs.access(filepath);
          console.log(`⏭️ Skipping ${filename} - already exists`);
          continue;
        } catch {
          // 파일이 없으므로 생성
        }
        
        // frontmatter 생성 (undefined 값들 제거)
        const frontmatter: any = {
          title: post.metadata.title,
          slug: post.metadata.slug,
          excerpt: post.metadata.excerpt || '',
          keywords: post.metadata.keywords || [],
          category: post.classification.category,
          tags: post.classification.tags || [],
          authorId: post.authorId,
          authorName: post.authorName,
          status: post.status,
          featured: post.featured || false,
          allowComments: post.allowComments !== false,
          createdAt: new Date(post.createdAt).toISOString(),
          updatedAt: new Date(post.updatedAt).toISOString(),
          readingTime: post.content.readingTime
        };

        // 선택적 필드들 - undefined가 아닐 때만 추가
        if (post.metadata.thumbnail) frontmatter.thumbnail = post.metadata.thumbnail;
        if (post.metadata.metaDescription) frontmatter.metaDescription = post.metadata.metaDescription;
        if (post.classification.difficulty) frontmatter.difficulty = post.classification.difficulty;
        if (post.classification.primaryLanguage) frontmatter.primaryLanguage = post.classification.primaryLanguage;
        if (post.publishedAt) frontmatter.publishedAt = new Date(post.publishedAt).toISOString();
        if (post.sortOrder !== undefined) frontmatter.sortOrder = post.sortOrder;
        
        // 마크다운 파일 생성
        const fileContent = matter.stringify(post.content.markdown, frontmatter);
        await fs.writeFile(filepath, fileContent, 'utf8');
        
        console.log(`✅ Created ${filename}`);
      }
      
      // JSON 파일을 백업으로 이름 변경
      const backupPath = path.join(__dirname, '../../data/posts.json.backup');
      await fs.rename(jsonPath, backupPath);
      
      console.log(`🎉 Migration completed! JSON file backed up as posts.json.backup`);
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
        console.log('📄 No JSON file found, skipping migration');
      } else {
        console.error('❌ Migration failed:', error);
        throw error;
      }
    }
  }
}