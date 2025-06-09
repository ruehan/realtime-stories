import { Schema, MapSchema, type } from '@colyseus/schema';
import { User } from './User';

export class LobbyState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
  @type('number') totalUsers!: number;
  @type('string') currentCategory!: string;
  @type('number') lastActivity!: number;
}