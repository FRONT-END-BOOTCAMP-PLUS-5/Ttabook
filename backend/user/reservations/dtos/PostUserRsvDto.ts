export class PostUserRsvDto {
  constructor(
    public userId: string,
    public roomId: number,
    public startTime: string,
    public endTime: string
  ) {}
}
