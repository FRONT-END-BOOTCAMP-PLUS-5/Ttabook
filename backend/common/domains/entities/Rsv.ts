import { Room } from './Room';
import { Space } from './Space';
import { User } from './User';

export class Rsv {
  constructor(
    public id: string, // UUID
    public userId: string, // UUID
    public roomId: number,
    public startTime: string,
    public endTime: string,
    public createdAt: string | null,
    public editedAt: string | null,
    public deletedAt: string | null,

    public room: Room | null,
    public space: Space | null,
    public user: User | null
  ) {}
}
