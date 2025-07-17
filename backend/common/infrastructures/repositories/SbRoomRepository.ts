import { RoomRepository } from '@/backend/common/domains/repositories/RoomRepository';
import { Room } from '../../domains/entities/Room';
import {
  SaveRequest,
  UpdateRequest,
} from '../../domains/repositories/roomRequest';
import { SupabaseClient } from '@supabase/supabase-js';
import { mapKeysToCamelCase } from '../utils';

export class SbRoomRepository implements RoomRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async save(room: SaveRequest): Promise<void> {
    await this.supabase.from('rooms').insert({
      name: room.roomName,
      detail: room.roomDetail,
      space_id: room.spaceId,
      position_x: room.positionX,
      position_y: room.positionY,
      width: room.width,
      height: room.height,
    });
  }

  async saveAll(rooms: SaveRequest[]): Promise<void> {
    const { error } = await this.supabase.from('rooms').insert(
      rooms.map((room) => ({
        space_id: room.spaceId,
        name: room.roomName,
        detail: room.roomDetail,
        position_x: room.positionX,
        position_y: room.positionY,
        width: room.width,
        height: room.height,
      }))
    );

    if (error) {
      throw new Error(`Failed to save rooms: ${error.message}`);
    }
  }

  async update(room: UpdateRequest): Promise<void> {
    await this.supabase
      .from('rooms')
      .update({
        name: room.roomName,
        detail: room.roomDetail,
        position_x: room.positionX,
        position_y: room.positionY,
        width: room.width,
        height: room.height,
      })
      .eq('id', room.roomId);
  }

  async upsert(rooms: UpdateRequest[]): Promise<void> {
    const updates = rooms.map((room) => ({
      id: room.roomId,
      name: room.roomName,
      detail: room.roomDetail,
      position_x: room.positionX,
      position_y: room.positionY,
      width: room.width,
      height: room.height,
    }));

    const { error } = await this.supabase.from('rooms').upsert(updates);

    if (error) {
      throw new Error(`Failed to update rooms: ${error.message}`);
    }
  }

  async findBySpaceId(spaceId: number): Promise<Room[] | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select(
        `
        *, 
        assets (
          type, 
          position_x, 
          position_y, 
          width, 
          height
        )`
      )
      .eq('space_id', spaceId);

    if (error) {
      throw new Error(`Failed to find rooms by space id: ${error.message}`);
    }

    return mapKeysToCamelCase(data) as Room[];
  }
}
