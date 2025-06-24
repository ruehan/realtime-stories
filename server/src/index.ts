import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { monitor } from '@colyseus/monitor';

// Import rooms
import { LobbyRoom } from './rooms/LobbyRoom';
import { PostRoom } from './rooms/PostRoom';
import { PageRoom } from './rooms/PageRoom';
import RoomStatsService from './services/RoomStatsService';
import { PostService } from './services/PostService';

const port = Number(process.env.PORT || 2567);
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create Colyseus server
const gameServer = new Server({
  server,
});

// Register room handlers
gameServer.define('lobby', LobbyRoom);
gameServer.define('post', PostRoom);

// Define page rooms for each page
const pages = ['about', 'portfolio', 'experience', 'categories', 'posts'];
pages.forEach(pageId => {
  gameServer.define(`page_${pageId}`, PageRoom, { pageId });
});

// Register Colyseus monitor for development
app.use('/colyseus', monitor());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Room stats endpoint
app.get('/api/room-stats', (req, res) => {
  const roomStatsService = RoomStatsService.getInstance();
  const stats = roomStatsService.getRoomStats();
  
  const response: { [key: string]: any } = {};
  stats.forEach((stat, roomType) => {
    response[roomType] = {
      roomType: stat.roomType,
      userCount: stat.userCount,
      lastUpdated: stat.lastUpdated
    };
  });
  
  res.json(response);
});

// Blog Posts API
const postService = PostService.getInstance();

// Initialize PostService on startup
(async () => {
  try {
    await postService.initialize();
    console.log('🚀 PostService initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize PostService:', error);
  }
})();

// Get all posts with filtering
app.get('/api/posts', async (req, res) => {
  try {
    console.log('🌐 API /api/posts called with query:', req.query);
    const { status, category, tag, featured, authorId, search, limit, offset } = req.query;
    
    let posts;
    if (search) {
      console.log('🔍 Searching posts with query:', search);
      posts = await postService.searchPosts(search as string, {
        status: status as string,
        category: category as string,
        tag: tag as string
      });
    } else {
      console.log('📋 Getting all posts with filters:', {
        status: status as string,
        category: category as string,
        tag: tag as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        authorId: authorId as string
      });
      posts = await postService.getAllPosts({
        status: status as string,
        category: category as string,
        tag: tag as string,
        featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
        authorId: authorId as string
      });
    }

    console.log(`📊 Total posts found: ${posts.length}`);

    // Apply pagination
    const limitNum = limit ? parseInt(limit as string) : undefined;
    const offsetNum = offset ? parseInt(offset as string) : 0;
    const totalPosts = posts.length; // Store total before pagination
    
    if (limitNum) {
      posts = posts.slice(offsetNum, offsetNum + limitNum);
      console.log(`📄 Paginated: returning ${posts.length} posts (offset: ${offsetNum}, limit: ${limitNum})`);
    }

    const response = {
      posts,
      total: totalPosts,
      limit: limitNum,
      offset: offsetNum
    };
    
    console.log('📤 Sending response with', posts.length, 'posts');
    res.json(response);
  } catch (error) {
    console.error('❌ Failed to get posts:', error);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// Get published posts (default endpoint for public use)
app.get('/api/posts/published', async (_req, res) => {
  try {
    const posts = await postService.getPublishedPosts();
    res.json(posts);
  } catch (error) {
    console.error('Failed to get published posts:', error);
    res.status(500).json({ error: 'Failed to retrieve published posts' });
  }
});

// Get featured posts
app.get('/api/posts/featured', async (_req, res) => {
  try {
    const posts = await postService.getFeaturedPosts();
    res.json(posts);
  } catch (error) {
    console.error('Failed to get featured posts:', error);
    res.status(500).json({ error: 'Failed to retrieve featured posts' });
  }
});

// Get popular posts
app.get('/api/posts/popular', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const posts = await postService.getPopularPosts(limit);
    res.json(posts);
  } catch (error) {
    console.error('Failed to get popular posts:', error);
    res.status(500).json({ error: 'Failed to retrieve popular posts' });
  }
});

// Get recent posts
app.get('/api/posts/recent', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const posts = await postService.getRecentPosts(limit);
    res.json(posts);
  } catch (error) {
    console.error('Failed to get recent posts:', error);
    res.status(500).json({ error: 'Failed to retrieve recent posts' });
  }
});

// Get post by ID
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await postService.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count
    await postService.incrementViewCount(req.params.id);
    
    res.json(post);
  } catch (error) {
    console.error('Failed to get post:', error);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// Get post by slug
app.get('/api/posts/slug/:slug', async (req, res) => {
  try {
    const post = await postService.getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment view count
    await postService.incrementViewCount(post.id);
    
    res.json(post);
  } catch (error) {
    console.error('Failed to get post by slug:', error);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// Get post table of contents
app.get('/api/posts/:id/toc', async (req, res) => {
  try {
    const toc = await postService.getPostTOC(req.params.id);
    if (!toc) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(toc);
  } catch (error) {
    console.error('Failed to get post TOC:', error);
    res.status(500).json({ error: 'Failed to retrieve table of contents' });
  }
});

// Get post code blocks
app.get('/api/posts/:id/code-blocks', async (req, res) => {
  try {
    const codeBlocks = await postService.getPostCodeBlocks(req.params.id);
    if (!codeBlocks) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(codeBlocks);
  } catch (error) {
    console.error('Failed to get post code blocks:', error);
    res.status(500).json({ error: 'Failed to retrieve code blocks' });
  }
});

// Get related posts
app.get('/api/posts/:id/related', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const relatedPosts = await postService.getRelatedPosts(req.params.id, limit);
    res.json(relatedPosts);
  } catch (error) {
    console.error('Failed to get related posts:', error);
    res.status(500).json({ error: 'Failed to retrieve related posts' });
  }
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const post = await postService.createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post
app.put('/api/posts/:id', async (req, res) => {
  try {
    const post = await postService.updatePost(req.params.id, req.body);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Failed to update post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const deleted = await postService.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Failed to delete post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get categories
app.get('/api/categories', async (_req, res) => {
  try {
    const categories = await postService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Failed to get categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// Get tags
app.get('/api/tags', async (_req, res) => {
  try {
    const tags = await postService.getTags();
    res.json(tags);
  } catch (error) {
    console.error('Failed to get tags:', error);
    res.status(500).json({ error: 'Failed to retrieve tags' });
  }
});

// Get blog statistics
app.get('/api/stats', async (_req, res) => {
  try {
    const stats = await postService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Failed to get statistics:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

gameServer.listen(port);

// Start room stats service
const roomStatsService = RoomStatsService.getInstance();
roomStatsService.start();

console.log(`🚀 Colyseus server is running on ws://localhost:${port}`);