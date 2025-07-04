"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostState = exports.Comment = void 0;
const schema_1 = require("@colyseus/schema");
const User_1 = require("./User");
class Comment extends schema_1.Schema {
}
exports.Comment = Comment;
__decorate([
    (0, schema_1.type)('string')
], Comment.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string')
], Comment.prototype, "userId", void 0);
__decorate([
    (0, schema_1.type)('string')
], Comment.prototype, "userName", void 0);
__decorate([
    (0, schema_1.type)('string')
], Comment.prototype, "content", void 0);
__decorate([
    (0, schema_1.type)('number')
], Comment.prototype, "timestamp", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], Comment.prototype, "isTyping", void 0);
class PostState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.users = new schema_1.MapSchema();
        this.comments = new schema_1.ArraySchema();
    }
}
exports.PostState = PostState;
__decorate([
    (0, schema_1.type)({ map: User_1.User })
], PostState.prototype, "users", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostState.prototype, "postId", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostState.prototype, "postTitle", void 0);
__decorate([
    (0, schema_1.type)('number')
], PostState.prototype, "viewCount", void 0);
__decorate([
    (0, schema_1.type)([Comment])
], PostState.prototype, "comments", void 0);
__decorate([
    (0, schema_1.type)('number')
], PostState.prototype, "lastActivity", void 0);
//# sourceMappingURL=PostState.js.map