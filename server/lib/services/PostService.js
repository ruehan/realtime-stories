"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const MarkdownService_1 = require("./MarkdownService");
class PostService {
    constructor() {
        this.dataPath = path_1.default.join(__dirname, '../../data/posts.json');
        this.posts = new Map();
        this.initialized = false;
        this.markdownService = MarkdownService_1.MarkdownService.getInstance();
    }
    static getInstance() {
        if (!PostService.instance) {
            PostService.instance = new PostService();
        }
        return PostService.instance;
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    generateId() {
        return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateReadingTime(markdown) {
        const wordsPerMinute = 200;
        const words = markdown.split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await promises_1.default.access(this.dataPath);
            const data = await promises_1.default.readFile(this.dataPath, 'utf8');
            const postsData = JSON.parse(data);
            this.posts.clear();
            postsData.forEach(post => {
                this.posts.set(post.id, post);
            });
            console.log(`Loaded ${this.posts.size} posts from storage`);
        }
        catch (error) {
            console.log('No existing posts file found, starting with empty collection');
            await this.createSamplePosts();
        }
        this.initialized = true;
    }
    async createSamplePosts() {
        const samplePosts = [
            {
                metadata: {
                    title: 'React와 TypeScript로 실시간 블로그 만들기',
                    excerpt: 'Colyseus를 활용한 실시간 기능을 가진 블로그 플랫폼 개발 경험을 공유합니다.',
                    thumbnail: '/images/react-typescript-blog.jpg',
                    metaDescription: 'React, TypeScript, Colyseus를 사용한 실시간 블로그 개발 가이드',
                    keywords: ['React', 'TypeScript', 'Colyseus', '실시간', '블로그']
                },
                content: {
                    markdown: `# React와 TypeScript로 실시간 블로그 만들기

이 포스트에서는 React와 TypeScript를 활용하여 실시간 기능을 가진 블로그를 만드는 과정을 설명합니다.

## 기술 스택
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Colyseus, Node.js
- **실시간 통신**: WebSocket

## 주요 기능

### 1. 실시간 사용자 추적
\`\`\`typescript
const { users } = useLobbyState(lobbyRoom);
\`\`\`

### 2. 미니맵 시각화
SVG를 활용한 인터랙티브 미니맵으로 사용자들의 위치를 실시간으로 표시합니다.

## 결론
실시간 기능을 통해 더 인터랙티브한 블로그 경험을 제공할 수 있습니다.`
                },
                classification: {
                    category: 'Frontend',
                    tags: ['React', 'TypeScript', 'Colyseus', 'WebSocket'],
                    difficulty: 'intermediate',
                    primaryLanguage: 'typescript'
                },
                authorId: 'author_1',
                authorName: 'Developer',
                status: 'published',
                featured: true
            },
            {
                metadata: {
                    title: 'Node.js 성능 최적화 가이드',
                    excerpt: 'Node.js 애플리케이션의 성능을 향상시키는 다양한 기법들을 알아봅니다.',
                    metaDescription: 'Node.js 성능 최적화를 위한 실무 가이드',
                    keywords: ['Node.js', '성능최적화', 'Backend', 'JavaScript']
                },
                content: {
                    markdown: `# Node.js 성능 최적화 가이드

Node.js 애플리케이션의 성능을 최적화하는 방법에 대해 알아보겠습니다.

## 1. 이벤트 루프 최적화

\`\`\`javascript
// 비효율적인 코드
function heavyComputation() {
  for (let i = 0; i < 1000000; i++) {
    // 무거운 연산
  }
}

// 최적화된 코드
function optimizedComputation() {
  return new Promise((resolve) => {
    setImmediate(() => {
      // 무거운 연산을 분할
      resolve();
    });
  });
}
\`\`\`

## 2. 메모리 관리
- 메모리 누수 방지
- 가비지 컬렉션 최적화

## 3. 캐싱 전략
Redis나 메모리 캐시를 활용한 성능 향상 방법을 설명합니다.`
                },
                classification: {
                    category: 'Backend',
                    tags: ['Node.js', '성능최적화', 'JavaScript'],
                    difficulty: 'advanced',
                    primaryLanguage: 'javascript'
                },
                authorId: 'author_1',
                authorName: 'Developer',
                status: 'published'
            }
        ];
        for (const postInput of samplePosts) {
            await this.createPost(postInput);
        }
    }
    async savePosts() {
        try {
            const postsArray = Array.from(this.posts.values());
            await promises_1.default.writeFile(this.dataPath, JSON.stringify(postsArray, null, 2), 'utf8');
        }
        catch (error) {
            console.error('Failed to save posts:', error);
            throw error;
        }
    }
    async createPost(input) {
        await this.initialize();
        const id = this.generateId();
        const slug = this.generateSlug(input.metadata.title);
        const now = Date.now();
        const markdownResult = this.markdownService.render(input.content.markdown, {
            enableCodeHighlighting: true,
            sanitize: true,
            generateTOC: true
        });
        const post = {
            id,
            metadata: {
                ...input.metadata,
                slug
            },
            content: {
                markdown: input.content.markdown,
                html: markdownResult.html,
                readingTime: markdownResult.readingTime
            },
            classification: input.classification,
            stats: {
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0
            },
            authorId: input.authorId,
            authorName: input.authorName,
            status: input.status,
            createdAt: now,
            updatedAt: now,
            publishedAt: input.status === 'published' ? now : undefined,
            featured: input.featured || false,
            allowComments: input.allowComments !== false,
            sortOrder: input.sortOrder
        };
        this.posts.set(id, post);
        await this.savePosts();
        return post;
    }
    async updatePost(id, input) {
        await this.initialize();
        const existingPost = this.posts.get(id);
        if (!existingPost)
            return null;
        const updatedPost = {
            ...existingPost,
            updatedAt: Date.now()
        };
        if (input.metadata) {
            updatedPost.metadata = { ...existingPost.metadata, ...input.metadata };
            if (input.metadata.title) {
                updatedPost.metadata.slug = this.generateSlug(input.metadata.title);
            }
        }
        if (input.content) {
            updatedPost.content = { ...existingPost.content, ...input.content };
            if (input.content.markdown) {
                const markdownResult = this.markdownService.render(input.content.markdown, {
                    enableCodeHighlighting: true,
                    sanitize: true,
                    generateTOC: true
                });
                updatedPost.content.html = markdownResult.html;
                updatedPost.content.readingTime = markdownResult.readingTime;
            }
        }
        if (input.classification) {
            updatedPost.classification = { ...existingPost.classification, ...input.classification };
        }
        if (input.status !== undefined) {
            updatedPost.status = input.status;
            if (input.status === 'published' && !existingPost.publishedAt) {
                updatedPost.publishedAt = Date.now();
            }
        }
        if (input.featured !== undefined)
            updatedPost.featured = input.featured;
        if (input.allowComments !== undefined)
            updatedPost.allowComments = input.allowComments;
        if (input.sortOrder !== undefined)
            updatedPost.sortOrder = input.sortOrder;
        this.posts.set(id, updatedPost);
        await this.savePosts();
        return updatedPost;
    }
    async getPost(id) {
        await this.initialize();
        return this.posts.get(id) || null;
    }
    async getPostBySlug(slug) {
        await this.initialize();
        for (const post of this.posts.values()) {
            if (post.metadata.slug === slug) {
                return post;
            }
        }
        return null;
    }
    async deletePost(id) {
        await this.initialize();
        const deleted = this.posts.delete(id);
        if (deleted) {
            await this.savePosts();
        }
        return deleted;
    }
    async getAllPosts(filters) {
        await this.initialize();
        let posts = Array.from(this.posts.values());
        if (filters) {
            if (filters.status) {
                posts = posts.filter(post => post.status === filters.status);
            }
            if (filters.category) {
                posts = posts.filter(post => post.classification.category === filters.category);
            }
            if (filters.tag) {
                posts = posts.filter(post => post.classification.tags.includes(filters.tag));
            }
            if (filters.featured !== undefined) {
                posts = posts.filter(post => post.featured === filters.featured);
            }
            if (filters.authorId) {
                posts = posts.filter(post => post.authorId === filters.authorId);
            }
        }
        return posts.sort((a, b) => {
            if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
                return a.sortOrder - b.sortOrder;
            }
            return b.createdAt - a.createdAt;
        });
    }
    async getPublishedPosts() {
        return this.getAllPosts({ status: 'published' });
    }
    async getFeaturedPosts() {
        return this.getAllPosts({ status: 'published', featured: true });
    }
    async incrementViewCount(id) {
        await this.initialize();
        const post = this.posts.get(id);
        if (post) {
            post.stats.viewCount++;
            await this.savePosts();
        }
    }
    async getCategories() {
        await this.initialize();
        const categories = new Set();
        for (const post of this.posts.values()) {
            if (post.status === 'published') {
                categories.add(post.classification.category);
            }
        }
        return Array.from(categories).sort();
    }
    async getTags() {
        await this.initialize();
        const tags = new Set();
        for (const post of this.posts.values()) {
            if (post.status === 'published') {
                post.classification.tags.forEach(tag => tags.add(tag));
            }
        }
        return Array.from(tags).sort();
    }
    async searchPosts(query, filters) {
        await this.initialize();
        let posts = await this.getAllPosts(filters);
        if (!query.trim()) {
            return posts;
        }
        const searchTerm = query.toLowerCase();
        return posts.filter(post => {
            const titleMatch = post.metadata.title.toLowerCase().includes(searchTerm);
            const excerptMatch = post.metadata.excerpt.toLowerCase().includes(searchTerm);
            const tagMatch = post.classification.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            const categoryMatch = post.classification.category.toLowerCase().includes(searchTerm);
            const contentWithoutCode = post.content.markdown.replace(/```[\s\S]*?```/g, '');
            const contentMatch = contentWithoutCode.toLowerCase().includes(searchTerm);
            return titleMatch || excerptMatch || tagMatch || categoryMatch || contentMatch;
        });
    }
    async getPostTOC(id) {
        await this.initialize();
        const post = this.posts.get(id);
        if (!post)
            return null;
        const result = this.markdownService.render(post.content.markdown, {
            generateTOC: true,
            enableCodeHighlighting: false,
            sanitize: false
        });
        return result.toc || [];
    }
    async getPostCodeBlocks(id) {
        await this.initialize();
        const post = this.posts.get(id);
        if (!post)
            return null;
        return this.markdownService.extractCodeBlocks(post.content.markdown);
    }
    async getRelatedPosts(id, limit = 5) {
        await this.initialize();
        const post = this.posts.get(id);
        if (!post)
            return [];
        const publishedPosts = await this.getPublishedPosts();
        const relatedPosts = publishedPosts
            .filter(p => p.id !== id)
            .map(p => {
            const commonTags = p.classification.tags.filter(tag => post.classification.tags.includes(tag)).length;
            const sameCategory = p.classification.category === post.classification.category;
            const score = commonTags * 2 + (sameCategory ? 1 : 0);
            return { post: p, score };
        })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.post);
        return relatedPosts;
    }
    async getPopularPosts(limit = 10) {
        const publishedPosts = await this.getPublishedPosts();
        return publishedPosts
            .sort((a, b) => b.stats.viewCount - a.stats.viewCount)
            .slice(0, limit);
    }
    async getRecentPosts(limit = 10) {
        const publishedPosts = await this.getPublishedPosts();
        return publishedPosts
            .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0))
            .slice(0, limit);
    }
    async getStatistics() {
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
}
exports.PostService = PostService;
//# sourceMappingURL=PostService.js.map