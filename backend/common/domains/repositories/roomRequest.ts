export class SaveRequest {
  constructor(
    public spaceId: number,
    public roomName: string,
    public roomDetail: string,
    public positionX?: number | null,
    public positionY?: number | null,
    public width?: number | null,
    public height?: number | null
  ) {}
}

export class UpdateRequest {
  constructor(
    public spaceId: number,
    public roomId: number,
    public roomName: string,
    public roomDetail: string,
    public positionX?: number | null,
    public positionY?: number | null,
    public width?: number | null,
    public height?: number | null
  ) {}
}
