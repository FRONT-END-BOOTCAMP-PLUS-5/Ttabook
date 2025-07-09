import { Rsv } from '../entities/Rsv';
import { DeleteRequest, SaveRequest, UpdateRequest } from './rsvRequest';

export interface RsvRepository {
  findAll(): Promise<Rsv[]>;
  findByUserId(id: string): Promise<Rsv[] | null>;
  findByRoomId(spaceId: number, roomId: number): Promise<Rsv[]>;

  save(reservation: SaveRequest): Promise<void>;
  update(reservation: UpdateRequest): Promise<void>;
  delete(reservation: DeleteRequest): Promise<void>;
}
