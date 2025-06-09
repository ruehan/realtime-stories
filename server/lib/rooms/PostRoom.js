"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRoom = void 0;
const colyseus_1 = require("colyseus");
const PostState_1 = require("../schemas/PostState");
const User_1 = require("../schemas/User");
class PostRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 50;
    }
    onCreate(options) {
        this.setState(new PostState_1.PostState());
        if (options.postId) {
            this.state.postId = options.postId;
            this.state.postTitle = options.postTitle || 'Untitled Post';
        }
        this.onMessage('cursor', (client, data) => {
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
                user.lastActive = Date.now();
            }
        });
        this.onMessage('typing', (client, data) => {
            this.broadcast('typing', {
                userId: client.sessionId,
                isTyping: data.isTyping
            }, { except: client });
        });
        this.onMessage('comment', (client, data) => {
            const user = this.state.users.get(client.sessionId);
            if (user && data.content) {
                const comment = new PostState_1.Comment();
                comment.id = `${Date.now()}-${Math.random()}`;
                comment.userId = client.sessionId;
                comment.userName = user.name;
                comment.content = data.content;
                comment.timestamp = Date.now();
                this.state.comments.push(comment);
                this.broadcast('newComment', {
                    comment: comment.toJSON()
                });
            }
        });
        this.onMessage('reaction', (client, data) => {
            var _a;
            this.broadcast('reaction', {
                userId: client.sessionId,
                userName: ((_a = this.state.users.get(client.sessionId)) === null || _a === void 0 ? void 0 : _a.name) || 'Anonymous',
                reaction: data.reaction,
                x: data.x,
                y: data.y
            });
        });
        this.setSimulationInterval(() => {
            this.state.viewCount = this.state.users.size;
            this.state.lastActivity = Date.now();
        }, 5000);
    }
    onJoin(client, options) {
        console.log(`${client.sessionId} joined PostRoom ${this.roomId}`);
        const user = new User_1.User(client.sessionId, options.name || `Reader${Math.floor(Math.random() * 1000)}`);
        if (options.avatar) {
            user.avatar = options.avatar;
        }
        user.x = Math.floor(Math.random() * 800);
        user.y = Math.floor(Math.random() * 600);
        user.status = 'reading';
        this.state.users.set(client.sessionId, user);
        this.state.viewCount = this.state.users.size;
        client.send('existingComments', {
            comments: this.state.comments.map(c => c.toJSON())
        });
        this.broadcast('userJoined', {
            userId: client.sessionId,
            userName: user.name
        }, { except: client });
    }
    onLeave(client, consented) {
        console.log(`${client.sessionId} left PostRoom ${this.roomId}`);
        const user = this.state.users.get(client.sessionId);
        const userName = (user === null || user === void 0 ? void 0 : user.name) || 'Anonymous';
        this.state.users.delete(client.sessionId);
        this.state.viewCount = this.state.users.size;
        this.broadcast('userLeft', {
            userId: client.sessionId,
            userName
        });
    }
    onDispose() {
        console.log(`PostRoom ${this.roomId} disposed`);
    }
}
exports.PostRoom = PostRoom;
//# sourceMappingURL=PostRoom.js.map