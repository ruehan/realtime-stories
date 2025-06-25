import { Schema, type } from '@colyseus/schema';

export class RoomInfo extends Schema {
  @type('string') roomId!: string;
  @type('string') roomName!: string;
  @type('number') userCount!: number;
  @type('number') lastUpdated!: number;
}