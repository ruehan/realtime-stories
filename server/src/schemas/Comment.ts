import { Schema, type } from '@colyseus/schema';

export class Comment extends Schema {
  @type('string') id!: string;
  @type('string') postId!: string;
  @type('string') authorId!: string;
  @type('string') authorName!: string;
  @type('string') content!: string;
  @type('number') createdAt!: number;
  @type('number') updatedAt!: number;
  @type('boolean') isEdited!: boolean;
  @type('string') authorColor!: string; // 실시간 사용자 구분용 색상
}