import { RoomRepository } from '@/app/api/domain/repository/RoomRepository';
import { Room } from '../../domain/entities/Room';
import {
  SaveRequest,
  UpdateRequest,
} from '../../domain/repository/roomRequest';
import { SupabaseClient } from '@supabase/supabase-js';

export class SbRoomRepository implements RoomRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async save(room: SaveRequest): Promise<void> {
    await this.supabase.from('room').insert({
      supply_id: room.supplyId,
      room_name: room.roomName,
      room_detail: room.roomDetail,
      position_x: room.positionX,
      position_y: room.positionY,
      scale_x: room.scaleX,
      scale_y: room.scaleY,
    });
  }

  async saveAll(rooms: SaveRequest[]): Promise<void> {
    const { error } = await this.supabase.from('room').insert(
      rooms.map((room) => ({
        supply_id: room.supplyId,
        room_name: room.roomName,
        room_detail: room.roomDetail,
        position_x: room.positionX,
        position_y: room.positionY,
        scale_x: room.scaleX,
        scale_y: room.scaleY,
      }))
    );

    if (error) {
      throw new Error(`Failed to save rooms: ${error.message}`);
    }
  }

  async update(room: UpdateRequest): Promise<void> {
    await this.supabase
      .from('room')
      .update({
        supply_id: room.supplyId,
        room_name: room.roomName,
        room_detail: room.roomDetail,
        position_x: room.positionX,
        position_y: room.positionY,
        scale_x: room.scaleX,
        scale_y: room.scaleY,
      })
      .eq('id', room.id);
  }

  async upsert(rooms: UpdateRequest[]): Promise<void> {
    const updates = rooms.map((room) => ({
      id: room.id,
      supply_id: room.supplyId,
      room_name: room.roomName,
      room_detail: room.roomDetail,
      position_x: room.positionX,
      position_y: room.positionY,
      scale_x: room.scaleX,
      scale_y: room.scaleY,
    }));

    const { error } = await this.supabase.from('room').upsert(updates);

    if (error) {
      throw new Error(`Failed to update rooms: ${error.message}`);
    }
  }

  async findById(id: number): Promise<Room | null> {
    return null;
  }

  async findBySpaceId(spaceId: number): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('room')
      .select('*')
      .eq('space_id', spaceId);

    if (error) {
      throw new Error(
        `Failed to fetch rooms for space ${spaceId}: ${error.message}`
      );
    }

    return data;
  }
}
