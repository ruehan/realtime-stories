"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyRoom = void 0;
const colyseus_1 = require("colyseus");
const LobbyState_1 = require("../schemas/LobbyState");
const User_1 = require("../schemas/User");
class LobbyRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 100;
    }
    onCreate(options) {
        const state = new LobbyState_1.LobbyState();
        state.totalUsers = 0;
        state.currentCategory = 'all';
        state.lastActivity = Date.now();
        this.setState(state);
        this.onMessage('move', (client, data) => {
            const user = this.state.users.get(client.sessionId);
            if (user) {
                user.x = data.x;
                user.y = data.y;
                user.lastActive = Date.now();
            }
        });
        this.onMessage('status', (client, data) => {
            const user = this.state.users.get(client.sessionId);
            if (user) {
                user.status = data.status;
                user.message = data.message || '';
                user.lastActive = Date.now();
            }
        });
        this.onMessage('chat', (client, message) => {
            var _a;
            this.broadcast('chat', {
                userId: client.sessionId,
                userName: ((_a = this.state.users.get(client.sessionId)) === null || _a === void 0 ? void 0 : _a.name) || 'Anonymous',
                message,
                timestamp: Date.now()
            });
        });
        this.setSimulationInterval(() => {
            const now = Date.now();
            const timeout = 60000;
            this.state.users.forEach((user, key) => {
                if (now - user.lastActive > timeout) {
                    this.state.users.delete(key);
                }
            });
            this.state.totalUsers = this.state.users.size;
            this.state.lastActivity = now;
        }, 30000);
    }
    onJoin(client, options) {
        console.log(`${client.sessionId} joined LobbyRoom`);
        const user = new User_1.User();
        user.id = client.sessionId;
        user.name = options.name || `User${Math.floor(Math.random() * 1000)}`;
        user.x = Math.floor(Math.random() * 800);
        user.y = Math.floor(Math.random() * 600);
        user.status = 'idle';
        user.message = '';
        user.lastActive = Date.now();
        this.state.users.set(client.sessionId, user);
        this.state.totalUsers = this.state.users.size;
        client.send('welcome', {
            userId: client.sessionId,
            message: 'Welcome to Realtime Stories!'
        });
    }
    onLeave(client, consented) {
        console.log(`${client.sessionId} left LobbyRoom (consented: ${consented})`);
        this.state.users.delete(client.sessionId);
        this.state.totalUsers = this.state.users.size;
        console.log(`Users remaining: ${this.state.totalUsers}`);
    }
    onDispose() {
        console.log('LobbyRoom disposed');
    }
}
exports.LobbyRoom = LobbyRoom;
//# sourceMappingURL=LobbyRoom.js.map