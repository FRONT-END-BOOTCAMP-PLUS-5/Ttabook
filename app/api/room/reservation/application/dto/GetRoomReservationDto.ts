export class GetRoomReservationDto {
  id: number;
  spaceId: number;
  roomId: number;
  userId: string;
  startTime: Date;
  endTime: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    id: number,
    spaceId: number,
    roomId: number,
    userId: string,
    startTime: Date,
    endTime: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.spaceId = spaceId;
    this.roomId = roomId;
    this.userId = userId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}
