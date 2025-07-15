export class PostUserRsvDto {
  constructor(
    public userId: string,
    public roomId: number,
    public startTime: Date,
    public endTime: Date
  ) {}
}
