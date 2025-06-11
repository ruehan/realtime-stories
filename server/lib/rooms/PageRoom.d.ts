import { Room, Client } from 'colyseus';
import { LobbyState } from '../schemas/LobbyState';
interface JoinOptions {
    name?: string;
    avatar?: string;
    pageId: string;
}
export declare class PageRoom extends Room<LobbyState> {
    maxClients: number;
    pageId: string;
    onCreate(options: any): void;
    onJoin(client: Client, options: JoinOptions): void;
    onLeave(client: Client, consented: boolean): void;
    onDispose(): void;
}
export {};
