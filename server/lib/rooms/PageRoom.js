"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageRoom = void 0;
const colyseus_1 = require("colyseus");
const LobbyState_1 = require("../schemas/LobbyState");
const User_1 = require("../schemas/User");
class PageRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 50;
        this.pageId = '';
    }
    onCreate(options) {
        const state = new LobbyState_1.LobbyState();
        state.totalUsers = 0;
        state.currentCategory = options.pageId || 'page';
        state.lastActivity = Date.now();
        this.setState(state);
        this.pageId = options.pageId || '';
        console.log(`PageRoom created for: ${this.pageId}`);
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
        this.setSimulationInterval(() => {
            const now = Date.now();
            const timeout = 60000;
            this.state.users.forEach((user, key) => {
                if (now - user.lastActive > timeout || user.status === 'disconnected') {
                    this.state.users.delete(key);
                }
            });
            this.state.totalUsers = this.state.users.size;
            this.state.lastActivity = now;
        }, 30000);
    }
    onJoin(client, options) {
        console.log(`${client.sessionId} joined PageRoom: ${this.pageId}`);
        const user = new User_1.User();
        user.id = client.sessionId;
        user.name = options.name || `User${Math.floor(Math.random() * 1000)}`;
        user.x = Math.floor(Math.random() * 800);
        user.y = Math.floor(Math.random() * 600);
        user.status = 'browsing';
        user.message = '';
        user.lastActive = Date.now();
        this.state.users.set(client.sessionId, user);
        this.state.totalUsers = this.state.users.size;
    }
    onLeave(client, consented) {
        console.log(`${client.sessionId} left PageRoom: ${this.pageId} (consented: ${consented})`);
        this.state.users.delete(client.sessionId);
        this.state.totalUsers = this.state.users.size;
        console.log(`Users remaining in ${this.pageId}: ${this.state.totalUsers}`);
    }
    onDispose() {
        console.log(`PageRoom ${this.pageId} disposed`);
    }
}
exports.PageRoom = PageRoom;
//# sourceMappingURL=PageRoom.js.map