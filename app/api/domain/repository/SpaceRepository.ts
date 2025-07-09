import { Space } from '../entities';
import { SaveRequest, UpdateRequest } from './spaceRequest';

export interface SpaceRepository {
  findById(id: number): Promise<Space>;

  save(space: SaveRequest): Promise<void>;
  update(space: UpdateRequest): Promise<void>;
}
