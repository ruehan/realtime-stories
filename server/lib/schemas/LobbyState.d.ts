import { Schema, MapSchema } from '@colyseus/schema';
import { User } from './User';
export declare class LobbyState extends Schema {
    users: MapSchema<User, string>;
    totalUsers: number;
    currentCategory: string;
    lastActivity: number;
}
