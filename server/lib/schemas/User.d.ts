import { Schema } from '@colyseus/schema';
export declare class User extends Schema {
    id: string;
    name: string;
    x: number;
    y: number;
    avatar: string;
    status: string;
    message: string;
    lastActive: number;
    constructor(id: string, name: string);
}
