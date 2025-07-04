import { Schema, MapSchema, type } from '@colyseus/schema';
import { User } from './User';
import { RoomInfo } from './RoomInfo';

export class LobbyState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
  @type({ map: RoomInfo }) rooms = new MapSchema<RoomInfo>();
  @type('number') totalUsers!: number;
  @type('string') currentCategory!: string;
  @type('number') lastActivity!: number;
}