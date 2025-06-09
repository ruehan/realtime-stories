import { Schema, MapSchema, type } from '@colyseus/schema';
import { User } from './User';

export class LobbyState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
  @type('number') totalUsers: number = 0;
  @type('string') currentCategory: string = 'all';
  @type('number') lastActivity: number = Date.now();
}