export class GetSpaceDto {
  id: number;
  name: string;
  room: {
    id: number;
    name: string;
    detail?: string;
    positionX?: number;
    positionY?: number;
    scaleX: number;
    scaleY: number;
  }[];

  constructor(
    id: number,
    name: string,
    room: {
      id: number;
      name: string;
      description?: string;
      positionX?: number;
      positionY?: number;
      scaleX: number;
      scaleY: number;
    }[]
  ) {
    this.id = id;
    this.name = name;
    this.room = room || [];
  }
}
