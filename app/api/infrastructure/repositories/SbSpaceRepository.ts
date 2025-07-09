import {
  SaveRequest,
  UpdateRequest,
} from '../../domain/repository/spaceRequest';
import { SpaceRepository } from '../../domain/repository/SpaceRepository';
import { supabaseAdmin as supabase } from '../supabase/client';
import SupabaseClient from '@supabase/supabase-js/dist/module/SupabaseClient';
import { Space } from '../../domain/entities/Space';

export class SbSpaceRepository implements SpaceRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findById(id: number): Promise<Space> {
    const { data, error } = await this.supabase
      .from('space')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`공간 조회 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async save(space: SaveRequest): Promise<void> {
    await supabase.from('space').insert({ name: space.name });
  }

  async update(space: UpdateRequest): Promise<void> {
    await supabase
      .from('space')
      .update({ name: space.name })
      .eq('id', space.id);
  }
}
