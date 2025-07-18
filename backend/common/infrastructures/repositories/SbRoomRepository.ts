import { RoomRepository } from '@/backend/common/domains/repositories/RoomRepository';
import { Room } from '@/backend/common/domains/entities/Room';
import {
  SaveRequest,
  UpdateRequest,
} from '@/backend/common/domains/repositories/roomRequest';
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
      space_id: room.spaceId,
      name: room.roomName,
      detail: room.roomDetail,
      position_x: room.positionX,
      position_y: room.positionY,
      width: room.width,
      height: room.height,
    }));

    const { data, error } = await this.supabase.from('rooms').upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error.message, error.details, error.hint);
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

    if (!data) return null;
    return mapKeysToCamelCase(data) as Room[];
  }

  async deleteBySapaceId(spaceId: number): Promise<void> {
    const { error } = await this.supabase
      .from('rooms')
      .delete()
      .eq('space_id', spaceId);

    if (error) {
      throw new Error(`Failed to delete rooms by space id: ${error.message}`);
    }
  }

  /**
   * [추가된 메서드]
   * 제공된 ID 배열에 해당하는 모든 방을 삭제합니다.
   */
  async deleteByIds(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return; // 삭제할 ID가 없으면 아무 작업도 하지 않음
    }

    const { error } = await this.supabase.from('rooms').delete().in('id', ids);

    if (error) {
      throw new Error(`Failed to delete rooms by ids: ${error.message}`);
    }
  }
}
