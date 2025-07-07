import { Room } from "../entities/Room";
import { SaveRequest } from "./roomRequest";

export interface RoomRepository {
  save(room: SaveRequest): Promise<void>;
  update(room: Room): Promise<void>;
  findById(id: number): Promise<Room | null>;
}