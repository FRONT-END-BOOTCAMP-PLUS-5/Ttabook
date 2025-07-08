import { SpaceRoomView } from '../../domain/entities/SpaceRoomView';
import {
  SaveRequest,
  UpdateRequest,
} from '../../domain/repository/spaceRequest';
import { SpaceRepository } from '../../domain/repository/SpaceRepository';
import { supabaseAdmin as supabase } from '../supabase/client';

export class SbSpaceRepository implements SpaceRepository {

  async findById(id: number): Promise<SpaceRoomView[]> {
    void id;
    throw new Error('SbSpaceRepository.findById not implemented.');
  }

  async save(space: SaveRequest): Promise<void> {
    await supabase.from('space').insert({name: space.name});
  }

  async update(space: UpdateRequest): Promise<void> {
    await supabase.from('space').update({name: space.name}).eq('id', space.id);
  }
}
