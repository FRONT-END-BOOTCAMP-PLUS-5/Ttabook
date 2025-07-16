export class GetUserRsvDto {
  constructor(
    public spaceId: number,
    public spaceName: string,
    public roomId: number,
    public roomName: string,
    public schedule: number[]
  ) {}
}
