import { Schema, type } from '@colyseus/schema';

export class User extends Schema {
  @type('string') id!: string;
  @type('string') name!: string;
  @type('number') x!: number;
  @type('number') y!: number;
  @type('string') status!: string;
  @type('string') message!: string;
  @type('number') lastActive!: number;
}