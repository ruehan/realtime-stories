import { Schema, type } from '@colyseus/schema';

export class User extends Schema {
  @type('string') id: string;
  @type('string') name: string;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') avatar: string = '';
  @type('string') status: string = 'idle'; // idle, typing, reading
  @type('string') message: string = '';
  @type('number') lastActive: number = Date.now();

  constructor(id: string, name: string) {
    super();
    this.id = id;
    this.name = name;
  }
}