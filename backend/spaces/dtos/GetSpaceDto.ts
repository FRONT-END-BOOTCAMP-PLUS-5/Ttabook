export class GetSpaceDto {
  id: number;
  name: string;
  room: {
    id: number;
    name: string;
    detail: string | null;
    spaceId: number;
    positionX?: number | null;
    positionY?: number | null;
    width?: number | null;
    height?: number | null;
    assets: { id: number; type: string; positionX?: number | null; positionY?: number | null; width?: number | null; height?: number | null }[];
  }[];

  constructor(
    id: number,
    name: string,
    room: {
      id: number;
      name: string;
      detail: string | null;
      spaceId: number;
      positionX?: number | null;
      positionY?: number | null;
      width?: number | null;
      height?: number | null;
      assets: { id: number; type: string; positionX?: number | null; positionY?: number | null; width?: number | null; height?: number | null }[];
    }[]
  ) {
    this.id = id;
    this.name = name;
    this.room = room || [];
  }
}
