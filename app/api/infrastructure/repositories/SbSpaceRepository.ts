import { SpaceRoomView } from '../../domain/entities/SpaceRoomView';
import {
  SaveRequest,
  UpdateRequest,
} from '../../domain/repository/spaceRequest';
import { SpaceRepository } from '../../domain/repository/SpaceRepository';
import { SupabaseClient } from '@supabase/supabase-js';


export class SbSpaceRepository implements SpaceRepository {
  private supabase: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findById(id: number): Promise<SpaceRoomView[]> {
    void id;
    throw new Error('SbSpaceRepository.findById not implemented.');
  }

  async save(space: SaveRequest): Promise<void> {
    await this.supabase.from('space').insert({name: space.name});
  }

  async update(space: UpdateRequest): Promise<void> {
    await this.supabase.from('space').update({name: space.name}).eq('id', space.id);
  }
}
