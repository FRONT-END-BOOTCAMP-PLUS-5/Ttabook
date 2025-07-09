import { Room } from './Room';

export class Space {
  constructor(
    public id: number,
    public name: string,
    public room: Room[] // 공간에 속한 방들, room 객체의 배열
  ) {}
}
