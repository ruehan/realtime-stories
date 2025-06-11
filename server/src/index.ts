import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { monitor } from '@colyseus/monitor';

// Import rooms
import { LobbyRoom } from './rooms/LobbyRoom';
import { PostRoom } from './rooms/PostRoom';
import { PageRoom } from './rooms/PageRoom';

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
gameServer.define('page', PageRoom);

// Register Colyseus monitor for development
app.use('/colyseus', monitor());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

gameServer.listen(port);
console.log(`🚀 Colyseus server is running on ws://localhost:${port}`);