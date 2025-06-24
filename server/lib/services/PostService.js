"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const MarkdownService_1 = require("./MarkdownService");
class PostService {
    constructor() {
        this.postsDirectory = path_1.default.join(__dirname, '../../data/posts');
        this.fileExtension = '.md';
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
        this.initialized = true;
        console.log('🔧 Initializing PostService...');
        console.log('📁 Posts directory:', this.postsDirectory);
        try {
            await promises_1.default.access(this.postsDirectory);
            console.log('✅ Posts directory exists');
        }
        catch (_a) {
            try {
                await promises_1.default.mkdir(this.postsDirectory, { recursive: true });
                console.log('📁 Created posts directory');
            }
            catch (error) {
                console.error('❌ Failed to create posts directory:', error);
                throw error;
            }
        }
        try {
            await this.migrateFromJsonToMarkdown();
            await this.loadPostsFromFiles();
            console.log(`✅ PostService initialized with ${this.posts.size} posts`);
            console.log('📋 Loaded posts:', Array.from(this.posts.values()).map(p => ({
                id: p.id,
                title: p.metadata.title,
                status: p.status
            })));
        }
        catch (error) {
            console.log('📝 Error loading posts:', error);
            this.posts.clear();
        }
    }
    async loadPostsFromFiles() {
        try {
            console.log('📁 Loading posts from directory:', this.postsDirectory);
            const files = await promises_1.default.readdir(this.postsDirectory);
            console.log('📁 Files found:', files);
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            console.log('📁 Markdown files:', markdownFiles);
            this.posts.clear();
            for (const filename of markdownFiles) {
                try {
                    const filepath = path_1.default.join(this.postsDirectory, filename);
                    console.log(`📄 Loading file: ${filename}`);
                    const fileContent = await promises_1.default.readFile(filepath, 'utf8');
                    const { data: frontmatter, content: markdown } = (0, gray_matter_1.default)(fileContent);
                    console.log(`📄 Frontmatter for ${filename}:`, frontmatter);
                    const post = await this.createPostFromFrontmatter(filename, frontmatter, markdown);
                    console.log(`✅ Loaded post: ${post.metadata.title} (status: ${post.status})`);
                    this.posts.set(post.id, post);
                }
                catch (error) {
                    console.error(`❌ Error loading post file ${filename}:`, error);
                }
            }
            console.log(`📊 Total posts loaded: ${this.posts.size}`);
        }
        catch (error) {
            console.error('❌ Error reading posts directory:', error);
            throw error;
        }
    }
    async createPostFromFrontmatter(filename, frontmatter, markdown) {
        const markdownResult = this.markdownService.render(markdown, {
            enableCodeHighlighting: true,
            sanitize: true,
            generateTOC: true
        });
        const createdAt = frontmatter.createdAt ? new Date(frontmatter.createdAt).getTime() : Date.now();
        const updatedAt = frontmatter.updatedAt ? new Date(frontmatter.updatedAt).getTime() : createdAt;
        const publishedAt = frontmatter.publishedAt ? new Date(frontmatter.publishedAt).getTime() : undefined;
        const post = {
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
                viewCount: 0,
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
    generateIdFromFilename(filename) {
        return filename.replace('.md', '').replace(/[^a-zA-Z0-9-_]/g, '-');
    }
    async createPost(input) {
        await this.initialize();
        const slug = this.generateSlug(input.metadata.title);
        const filename = `${slug}.md`;
        const filepath = path_1.default.join(this.postsDirectory, filename);
        const now = Date.now();
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
        const fileContent = gray_matter_1.default.stringify(input.content.markdown, frontmatter);
        await promises_1.default.writeFile(filepath, fileContent, 'utf8');
        const post = await this.createPostFromFrontmatter(filename, frontmatter, input.content.markdown);
        this.posts.set(post.id, post);
        return post;
    }
    async updatePost(id, input) {
        var _a;
        await this.initialize();
        const existingPost = this.posts.get(id);
        if (!existingPost)
            return null;
        const oldFilename = `${id}.md`;
        const oldFilepath = path_1.default.join(this.postsDirectory, oldFilename);
        try {
            const fileContent = await promises_1.default.readFile(oldFilepath, 'utf8');
            const { data: frontmatter, content: markdown } = (0, gray_matter_1.default)(fileContent);
            const now = Date.now();
            let newSlug = existingPost.metadata.slug;
            let newMarkdown = markdown;
            const updatedFrontmatter = { ...frontmatter };
            updatedFrontmatter.updatedAt = new Date(now).toISOString();
            if (input.metadata) {
                if (input.metadata.title) {
                    updatedFrontmatter.title = input.metadata.title;
                    newSlug = this.generateSlug(input.metadata.title);
                    updatedFrontmatter.slug = newSlug;
                }
                if (input.metadata.excerpt !== undefined)
                    updatedFrontmatter.excerpt = input.metadata.excerpt;
                if (input.metadata.thumbnail !== undefined)
                    updatedFrontmatter.thumbnail = input.metadata.thumbnail;
                if (input.metadata.metaDescription !== undefined)
                    updatedFrontmatter.metaDescription = input.metadata.metaDescription;
                if (input.metadata.keywords !== undefined)
                    updatedFrontmatter.keywords = input.metadata.keywords;
            }
            if ((_a = input.content) === null || _a === void 0 ? void 0 : _a.markdown) {
                newMarkdown = input.content.markdown;
                updatedFrontmatter.readingTime = this.calculateReadingTime(newMarkdown);
            }
            if (input.classification) {
                if (input.classification.category !== undefined)
                    updatedFrontmatter.category = input.classification.category;
                if (input.classification.tags !== undefined)
                    updatedFrontmatter.tags = input.classification.tags;
                if (input.classification.difficulty !== undefined)
                    updatedFrontmatter.difficulty = input.classification.difficulty;
                if (input.classification.primaryLanguage !== undefined)
                    updatedFrontmatter.primaryLanguage = input.classification.primaryLanguage;
            }
            if (input.status !== undefined) {
                updatedFrontmatter.status = input.status;
                if (input.status === 'published' && !frontmatter.publishedAt) {
                    updatedFrontmatter.publishedAt = new Date(now).toISOString();
                }
            }
            if (input.featured !== undefined)
                updatedFrontmatter.featured = input.featured;
            if (input.allowComments !== undefined)
                updatedFrontmatter.allowComments = input.allowComments;
            if (input.sortOrder !== undefined)
                updatedFrontmatter.sortOrder = input.sortOrder;
            const newFileContent = gray_matter_1.default.stringify(newMarkdown, updatedFrontmatter);
            const newFilename = `${newSlug}.md`;
            const newFilepath = path_1.default.join(this.postsDirectory, newFilename);
            if (newFilename !== oldFilename) {
                await promises_1.default.unlink(oldFilepath);
            }
            await promises_1.default.writeFile(newFilepath, newFileContent, 'utf8');
            const updatedPost = await this.createPostFromFrontmatter(newFilename, updatedFrontmatter, newMarkdown);
            this.posts.delete(id);
            this.posts.set(updatedPost.id, updatedPost);
            return updatedPost;
        }
        catch (error) {
            console.error(`Error updating post ${id}:`, error);
            return null;
        }
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
        const post = this.posts.get(id);
        if (!post)
            return false;
        try {
            const filename = `${id}.md`;
            const filepath = path_1.default.join(this.postsDirectory, filename);
            await promises_1.default.unlink(filepath);
            this.posts.delete(id);
            return true;
        }
        catch (error) {
            console.error(`Error deleting post ${id}:`, error);
            return false;
        }
    }
    async getAllPosts(filters) {
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
                posts = posts.filter(post => post.classification.tags.includes(filters.tag));
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
    async migrateFromJsonToMarkdown() {
        const jsonPath = path_1.default.join(__dirname, '../../data/posts.json');
        try {
            await promises_1.default.access(jsonPath);
            const jsonContent = await promises_1.default.readFile(jsonPath, 'utf8');
            const posts = JSON.parse(jsonContent);
            console.log(`📁 Found ${posts.length} posts in JSON file, migrating to markdown files...`);
            for (const post of posts) {
                const filename = `${post.metadata.slug}.md`;
                const filepath = path_1.default.join(this.postsDirectory, filename);
                try {
                    await promises_1.default.access(filepath);
                    console.log(`⏭️ Skipping ${filename} - already exists`);
                    continue;
                }
                catch (_a) {
                }
                const frontmatter = {
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
                if (post.metadata.thumbnail)
                    frontmatter.thumbnail = post.metadata.thumbnail;
                if (post.metadata.metaDescription)
                    frontmatter.metaDescription = post.metadata.metaDescription;
                if (post.classification.difficulty)
                    frontmatter.difficulty = post.classification.difficulty;
                if (post.classification.primaryLanguage)
                    frontmatter.primaryLanguage = post.classification.primaryLanguage;
                if (post.publishedAt)
                    frontmatter.publishedAt = new Date(post.publishedAt).toISOString();
                if (post.sortOrder !== undefined)
                    frontmatter.sortOrder = post.sortOrder;
                const fileContent = gray_matter_1.default.stringify(post.content.markdown, frontmatter);
                await promises_1.default.writeFile(filepath, fileContent, 'utf8');
                console.log(`✅ Created ${filename}`);
            }
            const backupPath = path_1.default.join(__dirname, '../../data/posts.json.backup');
            await promises_1.default.rename(jsonPath, backupPath);
            console.log(`🎉 Migration completed! JSON file backed up as posts.json.backup`);
        }
        catch (error) {
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                console.log('📄 No JSON file found, skipping migration');
            }
            else {
                console.error('❌ Migration failed:', error);
                throw error;
            }
        }
    }
}
exports.PostService = PostService;
//# sourceMappingURL=PostService.js.map