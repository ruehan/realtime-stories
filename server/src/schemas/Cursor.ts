import { Schema, type } from '@colyseus/schema';

export class Cursor extends Schema {
  @type('string') userId!: string;
  @type('string') userName!: string;
  @type('number') x!: number; // 0~100 퍼센트 값 (가로 반응형)
  @type('number') y!: number; // 절대 픽셀 값 (세로 스크롤)
  @type('string') color!: string;
  @type('number') lastUpdate!: number;
  @type('boolean') isActive!: boolean;
  @type('string') currentPage!: string;
}