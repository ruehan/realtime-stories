"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colyseus_1 = require("colyseus");
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const monitor_1 = require("@colyseus/monitor");
const LobbyRoom_1 = require("./rooms/LobbyRoom");
const PostRoom_1 = require("./rooms/PostRoom");
const PageRoom_1 = require("./rooms/PageRoom");
const RoomStatsService_1 = __importDefault(require("./services/RoomStatsService"));
const PostService_1 = require("./services/PostService");
const port = Number(process.env.PORT || 2567);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = (0, http_1.createServer)(app);
const gameServer = new colyseus_1.Server({
    server,
});
gameServer.define('lobby', LobbyRoom_1.LobbyRoom);
gameServer.define('post', PostRoom_1.PostRoom);
const pages = ['about', 'portfolio', 'experience', 'categories', 'posts'];
pages.forEach(pageId => {
    gameServer.define(`page_${pageId}`, PageRoom_1.PageRoom, { pageId });
});
app.use('/colyseus', (0, monitor_1.monitor)());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/room-stats', (req, res) => {
    const roomStatsService = RoomStatsService_1.default.getInstance();
    const stats = roomStatsService.getRoomStats();
    const response = {};
    stats.forEach((stat, roomType) => {
        response[roomType] = {
            roomType: stat.roomType,
            userCount: stat.userCount,
            lastUpdated: stat.lastUpdated
        };
    });
    res.json(response);
});
const postService = PostService_1.PostService.getInstance();
app.get('/api/posts', async (req, res) => {
    try {
        const { status, category, tag, featured, authorId, search, limit, offset } = req.query;
        let posts;
        if (search) {
            posts = await postService.searchPosts(search, {
                status: status,
                category: category,
                tag: tag
            });
        }
        else {
            posts = await postService.getAllPosts({
                status: status,
                category: category,
                tag: tag,
                featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
                authorId: authorId
            });
        }
        const limitNum = limit ? parseInt(limit) : undefined;
        const offsetNum = offset ? parseInt(offset) : 0;
        if (limitNum) {
            posts = posts.slice(offsetNum, offsetNum + limitNum);
        }
        res.json({
            posts,
            total: posts.length,
            limit: limitNum,
            offset: offsetNum
        });
    }
    catch (error) {
        console.error('Failed to get posts:', error);
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
});
app.get('/api/posts/published', async (_req, res) => {
    try {
        const posts = await postService.getPublishedPosts();
        res.json(posts);
    }
    catch (error) {
        console.error('Failed to get published posts:', error);
        res.status(500).json({ error: 'Failed to retrieve published posts' });
    }
});
app.get('/api/posts/featured', async (_req, res) => {
    try {
        const posts = await postService.getFeaturedPosts();
        res.json(posts);
    }
    catch (error) {
        console.error('Failed to get featured posts:', error);
        res.status(500).json({ error: 'Failed to retrieve featured posts' });
    }
});
app.get('/api/posts/popular', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const posts = await postService.getPopularPosts(limit);
        res.json(posts);
    }
    catch (error) {
        console.error('Failed to get popular posts:', error);
        res.status(500).json({ error: 'Failed to retrieve popular posts' });
    }
});
app.get('/api/posts/recent', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const posts = await postService.getRecentPosts(limit);
        res.json(posts);
    }
    catch (error) {
        console.error('Failed to get recent posts:', error);
        res.status(500).json({ error: 'Failed to retrieve recent posts' });
    }
});
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await postService.getPost(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await postService.incrementViewCount(req.params.id);
        res.json(post);
    }
    catch (error) {
        console.error('Failed to get post:', error);
        res.status(500).json({ error: 'Failed to retrieve post' });
    }
});
app.get('/api/posts/slug/:slug', async (req, res) => {
    try {
        const post = await postService.getPostBySlug(req.params.slug);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await postService.incrementViewCount(post.id);
        res.json(post);
    }
    catch (error) {
        console.error('Failed to get post by slug:', error);
        res.status(500).json({ error: 'Failed to retrieve post' });
    }
});
app.get('/api/posts/:id/toc', async (req, res) => {
    try {
        const toc = await postService.getPostTOC(req.params.id);
        if (!toc) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(toc);
    }
    catch (error) {
        console.error('Failed to get post TOC:', error);
        res.status(500).json({ error: 'Failed to retrieve table of contents' });
    }
});
app.get('/api/posts/:id/code-blocks', async (req, res) => {
    try {
        const codeBlocks = await postService.getPostCodeBlocks(req.params.id);
        if (!codeBlocks) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(codeBlocks);
    }
    catch (error) {
        console.error('Failed to get post code blocks:', error);
        res.status(500).json({ error: 'Failed to retrieve code blocks' });
    }
});
app.get('/api/posts/:id/related', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 5;
        const relatedPosts = await postService.getRelatedPosts(req.params.id, limit);
        res.json(relatedPosts);
    }
    catch (error) {
        console.error('Failed to get related posts:', error);
        res.status(500).json({ error: 'Failed to retrieve related posts' });
    }
});
app.post('/api/posts', async (req, res) => {
    try {
        const post = await postService.createPost(req.body);
        res.status(201).json(post);
    }
    catch (error) {
        console.error('Failed to create post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});
app.put('/api/posts/:id', async (req, res) => {
    try {
        const post = await postService.updatePost(req.params.id, req.body);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    }
    catch (error) {
        console.error('Failed to update post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const deleted = await postService.deletePost(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});
app.get('/api/categories', async (_req, res) => {
    try {
        const categories = await postService.getCategories();
        res.json(categories);
    }
    catch (error) {
        console.error('Failed to get categories:', error);
        res.status(500).json({ error: 'Failed to retrieve categories' });
    }
});
app.get('/api/tags', async (_req, res) => {
    try {
        const tags = await postService.getTags();
        res.json(tags);
    }
    catch (error) {
        console.error('Failed to get tags:', error);
        res.status(500).json({ error: 'Failed to retrieve tags' });
    }
});
app.get('/api/stats', async (_req, res) => {
    try {
        const stats = await postService.getStatistics();
        res.json(stats);
    }
    catch (error) {
        console.error('Failed to get statistics:', error);
        res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
});
gameServer.listen(port);
const roomStatsService = RoomStatsService_1.default.getInstance();
roomStatsService.start();
console.log(`🚀 Colyseus server is running on ws://localhost:${port}`);
//# sourceMappingURL=index.js.map