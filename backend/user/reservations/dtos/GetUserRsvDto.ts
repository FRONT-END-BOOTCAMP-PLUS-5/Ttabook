export class GetUserRsvDto {
  constructor(
    public rsvId: string,
    public spaceId: number,
    public spaceName: string,
    public roomId: number,
    public roomName: string,
    public lastEdit: string,
    public schedule: number[]
  ) {}
}
