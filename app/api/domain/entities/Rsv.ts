export class Rsv {
  constructor(
    public id: string, // UUID
    public userId: string, // UUID
    public spaceId: number,
    public roomId: number,
    public startTime: Date,
    public endTime: Date,
    public createdAt: Date,
    public editedAt: Date,
    public deletedAt: Date | null
  ) {}
}