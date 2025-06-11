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

gameServer.listen(port);

// Start room stats service
const roomStatsService = RoomStatsService.getInstance();
roomStatsService.start();

console.log(`🚀 Colyseus server is running on ws://localhost:${port}`);