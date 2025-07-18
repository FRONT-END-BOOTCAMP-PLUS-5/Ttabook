export class GetRoomInSpaceDto {
  constructor(
    public id: number,
    public name: string,
    public detail: string | null,
    public spaceId: number,
    public positionX?: number | null,
    public positionY?: number | null,
    public width?: number | null,
    public height?: number | null,
    public assets?: {
      id: number;
      type: string;
      positionX?: number | null;
      positionY?: number | null;
      width?: number | null;
      height?: number | null;
    }[]
  ) {}
}
