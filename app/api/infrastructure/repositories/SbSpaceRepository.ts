import { SpaceRoomView } from '../../domain/entities/SpaceRoomView';
import {
  SaveRequest,
  UpdateRequest,
} from '../../domain/repository/spaceRequest';
import { SpaceRepository } from '../../domain/repository/SpaceRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export class SbSpaceRepository implements SpaceRepository {
  private supabase;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findById(id: number): Promise<SpaceRoomView[]> {
    return [];
  }

  async save(space: SaveRequest): Promise<void> {}

  async update(space: UpdateRequest): Promise<void> {}
}
