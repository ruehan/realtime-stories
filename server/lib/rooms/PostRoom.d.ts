import { Room, Client } from 'colyseus';
import { PostState } from '../schemas/PostState';
interface JoinOptions {
    postId: string;
    postTitle?: string;
    name?: string;
    avatar?: string;
}
export declare class PostRoom extends Room<PostState> {
    maxClients: number;
    onCreate(options: any): void;
    onJoin(client: Client, options: JoinOptions): void;
    onLeave(client: Client, consented: boolean): void;
    onDispose(): void;
}
export {};
