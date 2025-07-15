export class RoomDto {
  constructor(
    public id: number,
    public spaceId: number,
    public roomName: string,
    public roomDetail: string,
    public positionX?: number | null,
    public positionY?: number | null,
    public width?: number | null,
    public height?: number | null
  ) {}
}

export class PutRoomQueryDto {
  constructor(
    public token: string,
    public rooms: RoomDto[]
  ) {}
}
