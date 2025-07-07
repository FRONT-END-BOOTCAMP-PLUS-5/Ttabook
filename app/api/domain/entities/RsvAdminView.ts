export class RsvAdminView {
  constructor(
    public spaceId: number,
    public userId: string, // UUID
    public roomId: number,
    public roomName: string,
    public rsvId: string,
    public startTime: Date,
    public endTime: Date
  ) {}
}