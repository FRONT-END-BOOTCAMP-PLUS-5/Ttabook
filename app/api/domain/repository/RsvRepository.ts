import { Rsv } from '../entities/Rsv';
import { RsvRoomSub } from '../entities/RsvRoomSub';
import { RsvUserView } from '../entities/RsvUserView';
import { DeleteRequest, SaveRequest, UpdateRequest } from './rsvRequest';

export interface RsvRepository {
  findAll(): Promise<Rsv[]>;
  findByUserId(id: string): Promise<RsvUserView[] | null>;
  findByRoomId(spaceId: number, roomId: number): Promise<RsvRoomSub[]>;

  save(reservation: SaveRequest): Promise<void>;
  update(reservation: UpdateRequest): Promise<void>;
  delete(reservation: DeleteRequest): Promise<void>;
}
