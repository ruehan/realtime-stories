import { Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import { User } from './User';
export declare class Comment extends Schema {
    id: string;
    userId: string;
    userName: string;
    content: string;
    timestamp: number;
    isTyping: boolean;
}
export declare class PostState extends Schema {
    users: MapSchema<User, string>;
    postId: string;
    postTitle: string;
    viewCount: number;
    comments: ArraySchema<Comment>;
    lastActivity: number;
}
