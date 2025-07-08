import { Space } from '../entities/Space';

export interface SpaceRepository {
  findById(id: number): Promise<Space>;
}
