import { Schema, MapSchema, type } from '@colyseus/schema';
import { User } from './User';
import { Cursor } from './Cursor';

export class PageState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
  @type({ map: Cursor }) cursors = new MapSchema<Cursor>();
  @type('number') totalUsers!: number;
  @type('string') pageId!: string;
  @type('number') lastActivity!: number;
}