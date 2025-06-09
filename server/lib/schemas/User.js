"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const schema_1 = require("@colyseus/schema");
class User extends schema_1.Schema {
}
exports.User = User;
__decorate([
    (0, schema_1.type)('string')
], User.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)('string')
], User.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)('number')
], User.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)('number')
], User.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)('string')
], User.prototype, "status", void 0);
__decorate([
    (0, schema_1.type)('string')
], User.prototype, "message", void 0);
__decorate([
    (0, schema_1.type)('number')
], User.prototype, "lastActive", void 0);
//# sourceMappingURL=User.js.map