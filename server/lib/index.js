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
app.use('/colyseus', (0, monitor_1.monitor)());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
gameServer.listen(port);
console.log(`🚀 Colyseus server is running on ws://localhost:${port}`);
//# sourceMappingURL=index.js.map