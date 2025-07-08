import { Space } from '../../domain/entities/Space';
import { SpaceRepository } from '../../domain/repository/SpaceRepository';
import { supabaseAdmin } from '../supabase/client';

export class SbSpaceRepository implements SpaceRepository {
  async findById(id: number): Promise<Space> {
    const { data, error } = await supabaseAdmin
      .from('space')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`공간 조회 중 오류 발생: ${error.message}`);
    }

    return data;
  }
}
