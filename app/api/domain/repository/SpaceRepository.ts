import { SpaceRoomView } from "../entities/SpaceRoomView";
import { SaveRequest, UpdateRequest } from "./spaceRequest";

export interface SpaceRepository {
  findById(id: number): Promise<SpaceRoomView[]>;
  
  save(space: SaveRequest): Promise<void>;
  update(space: UpdateRequest): Promise<void>;
}