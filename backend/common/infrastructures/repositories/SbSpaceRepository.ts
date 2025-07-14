import {
  SaveRequest,
  UpdateRequest,
} from '../../domains/repositories/spaceRequest';
import { SpaceRepository } from '../../domains/repositories/SpaceRepository';
import SupabaseClient from '@supabase/supabase-js/dist/module/SupabaseClient';
import { Space } from '../../domains/entities/Space';

export class SbSpaceRepository implements SpaceRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findById(id: number): Promise<Space> {
    const { data, error } = await this.supabase
      .from('spaces')
      .select(
        `
         *,
        rooms: room (
          *,
          supplies (*)
         )
        `
      )
      // .select('*')
      .eq('id', id)
      .single();
    if (error) {
      throw new Error(`공간 조회 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async save(space: SaveRequest): Promise<void> {
    await this.supabase.from('spaces').insert({ name: space.name });
  }

  async update(space: UpdateRequest): Promise<void> {
    await this.supabase
      .from('spaces')
      .update({ name: space.name })
      .eq('id', space.id);
  }
}
