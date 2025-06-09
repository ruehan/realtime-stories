import { Schema, MapSchema, ArraySchema, type } from '@colyseus/schema';
import { User } from './User';

export class Comment extends Schema {
  @type('string') id!: string;
  @type('string') userId!: string;
  @type('string') userName!: string;
  @type('string') content!: string;
  @type('number') timestamp!: number;
  @type('boolean') isTyping!: boolean;
}

export class PostState extends Schema {
  @type({ map: User }) users = new MapSchema<User>();
  @type('string') postId!: string;
  @type('string') postTitle!: string;
  @type('number') viewCount!: number;
  @type([Comment]) comments = new ArraySchema<Comment>();
  @type('number') lastActivity!: number;
}