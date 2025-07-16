import { Room } from '../entities/Room';
import { SaveRequest, UpdateRequest } from './roomRequest';

export interface RoomRepository {
  save(room: SaveRequest): Promise<void>;
  saveAll(rooms: SaveRequest[]): Promise<void>;
  update(room: UpdateRequest): Promise<void>;
  upsert(rooms: UpdateRequest[]): Promise<void>;
  findBySpaceId(id: number): Promise<Room[] | null>;
  
}
