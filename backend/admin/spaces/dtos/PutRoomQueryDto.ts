export class RoomDto {
  constructor(
    public id: number,
    public supplyId: string,
    public roomName: string,
    public roomDetail: string,
    public positionX: number,
    public positionY: number,
    public scaleX: number,
    public scaleY: number
  ) {}
}

export class PutRoomQueryDto {
  constructor(
    public token: string,
    public rooms: RoomDto[]
  ) {}
}
