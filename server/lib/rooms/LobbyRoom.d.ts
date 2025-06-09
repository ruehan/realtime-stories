import { Room, Client } from 'colyseus';
import { LobbyState } from '../schemas/LobbyState';
interface JoinOptions {
    name?: string;
    avatar?: string;
}
export declare class LobbyRoom extends Room<LobbyState> {
    maxClients: number;
    onCreate(options: any): void;
    onJoin(client: Client, options: JoinOptions): void;
    onLeave(client: Client, consented: boolean): void;
    onDispose(): void;
}
export {};
