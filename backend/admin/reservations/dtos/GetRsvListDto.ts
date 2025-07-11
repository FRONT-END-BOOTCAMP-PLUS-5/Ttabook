type UserType = {
  userId: string; // UUID
};

type RoomType = {
  roomId: number;
  roomName: string;
};

type RsvType = {
  rsvId: string;
  startTime: Date;
  endTime: Date;
};

export class GetRsvListDto {
  constructor(
    public spaceId: number,
    public room: RoomType,
    public user: UserType,
    public rsv: RsvType
  ) {}
}
