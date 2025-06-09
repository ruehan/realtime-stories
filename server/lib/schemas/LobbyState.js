"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyState = void 0;
const schema_1 = require("@colyseus/schema");
const User_1 = require("./User");
class LobbyState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.users = new schema_1.MapSchema();
    }
}
exports.LobbyState = LobbyState;
__decorate([
    (0, schema_1.type)({ map: User_1.User })
], LobbyState.prototype, "users", void 0);
__decorate([
    (0, schema_1.type)('number')
], LobbyState.prototype, "totalUsers", void 0);
__decorate([
    (0, schema_1.type)('string')
], LobbyState.prototype, "currentCategory", void 0);
__decorate([
    (0, schema_1.type)('number')
], LobbyState.prototype, "lastActivity", void 0);
//# sourceMappingURL=LobbyState.js.map