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
    void id;
    throw new Error('SbSpaceRepository.findById not implemented.');
  }

  async save(space: SaveRequest): Promise<void> {
    void space;
    throw new Error('SbSpaceRepository.save not implemented.');
  }

  async update(space: UpdateRequest): Promise<void> {
    void space;
    throw new Error('SbSpaceRepository.update not implemented.');
  }
  async delete(id: number): Promise<void> {
    void id;
    throw new Error('SbSpaceRepository.delete not implemented.');
  }

  async findAll(): Promise<SpaceRoomView[]> {
    throw new Error('SbSpaceRepository.findAll not implemented.');
  }
}
