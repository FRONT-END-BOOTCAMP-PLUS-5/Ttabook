import { Room } from "./Room";

export class Rsv {
  constructor(
    public id: string, // UUID
    public userId: string, // UUID
    public spaceId: number,
    public roomId: number,
    public startTime: Date,
    public endTime: Date,
    public createdAt: Date |null,
    public editedAt: Date | null,
    public deletedAt: Date | null,

    public room: Room | null, 
  ) {}
}