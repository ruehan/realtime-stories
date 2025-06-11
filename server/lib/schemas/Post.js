"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = exports.PostStats = exports.PostClassification = exports.PostContent = exports.PostMetadata = void 0;
const schema_1 = require("@colyseus/schema");
class PostMetadata extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.keywords = [];
    }
}
exports.PostMetadata = PostMetadata;
__decorate([
    (0, schema_1.type)('string')
], PostMetadata.prototype, "title", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostMetadata.prototype, "slug", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostMetadata.prototype, "excerpt", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostMetadata.prototype, "thumbnail", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostMetadata.prototype, "metaDescription", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], PostMetadata.prototype, "keywords", void 0);
class PostContent extends schema_1.Schema {
}
exports.PostContent = PostContent;
__decorate([
    (0, schema_1.type)('string')
], PostContent.prototype, "markdown", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostContent.prototype, "html", void 0);
__decorate([
    (0, schema_1.type)('number')
], PostContent.prototype, "readingTime", void 0);
class PostClassification extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.tags = [];
    }
}
exports.PostClassification = PostClassification;
__decorate([
    (0, schema_1.type)('string')
], PostClassification.prototype, "category", void 0);
__decorate([
    (0, schema_1.type)(['string'])
], PostClassification.prototype, "tags", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostClassification.prototype, "difficulty", void 0);
__decorate([
    (0, schema_1.type)('string')
], PostClassification.prototype, "primaryLanguage", void 0);
class PostStats extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.viewCount = 0;
        this.likeCount = 0;
        this.commentCount = 0;
        this.shareCount = 0;
    }
}
exports.PostStats = PostStats;
__decorate([
    (0, schema_1.type)('number')
], PostStats.prototype, "viewCount", void 0);
__decorate([
    (0, schema_1.type)('number')
], PostStats.prototype, "likeCount", void 0);
__decorate([
    (0, schema_1.type)('number')
], PostStats.prototype, "commentCount", void 0);
__decorate([
    (0, schema_1.type)('number')
], PostStats.prototype, "shareCount", void 0);
class Post extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.stats = new PostStats();
        this.featured = false;
        this.allowComments = true;
    }
}
exports.Post = Post;
__decorate([
    (0, schema_1.type)('string')
], Post.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)(PostMetadata)
], Post.prototype, "metadata", void 0);
__decorate([
    (0, schema_1.type)(PostContent)
], Post.prototype, "content", void 0);
__decorate([
    (0, schema_1.type)(PostClassification)
], Post.prototype, "classification", void 0);
__decorate([
    (0, schema_1.type)(PostStats)
], Post.prototype, "stats", void 0);
__decorate([
    (0, schema_1.type)('string')
], Post.prototype, "authorId", void 0);
__decorate([
    (0, schema_1.type)('string')
], Post.prototype, "authorName", void 0);
__decorate([
    (0, schema_1.type)('string')
], Post.prototype, "status", void 0);
__decorate([
    (0, schema_1.type)('number')
], Post.prototype, "createdAt", void 0);
__decorate([
    (0, schema_1.type)('number')
], Post.prototype, "updatedAt", void 0);
__decorate([
    (0, schema_1.type)('number')
], Post.prototype, "publishedAt", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], Post.prototype, "featured", void 0);
__decorate([
    (0, schema_1.type)('boolean')
], Post.prototype, "allowComments", void 0);
__decorate([
    (0, schema_1.type)('number')
], Post.prototype, "sortOrder", void 0);
//# sourceMappingURL=Post.js.map