export class PostUserRsvDto {
  constructor(
    public userId: string,
    public spaceId: number,
    public roomId: number,
    public startTime: Date,
    public endTime: Date
  ) {}
}
