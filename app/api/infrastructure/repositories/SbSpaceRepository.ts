import { SpaceRoomView } from "../../domain/entities/SpaceRoomView";
import { SaveRequest, UpdateRequest } from "../../domain/repository/spaceRequest";
import { SpaceRepository } from "../../domain/repository/SpaceRepository";

export class SbSpaceRepository implements SpaceRepository{
  async findById(id: number): Promise<SpaceRoomView[]> {
    return [];
  }

  async save(space: SaveRequest): Promise<void> {
    
  }

  async update(space: UpdateRequest): Promise<void> {
    
  }
}