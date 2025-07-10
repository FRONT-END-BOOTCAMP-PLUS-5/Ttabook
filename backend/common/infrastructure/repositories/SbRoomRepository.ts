import { RoomRepository } from '@/backend/common/domain/repository/RoomRepository';
import { Room } from '../../domain/entities/Room';
import { SaveRequest, UpdateRequest } from '../../domain/repository/roomRequest';
import { SupabaseClient } from '@supabase/supabase-js';

export class SbRoomRepository implements RoomRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  
  async save(room: SaveRequest): Promise<void> {
    await this.supabase.from('rooms').insert({
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
    const { error } = await this.supabase.from('rooms').insert(
      rooms.map(room => ({
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
    await this.supabase.from('rooms')
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
    const updates = rooms.map(room => ({
      id: room.id,
      supply_id: room.supplyId,
      room_name: room.roomName,
      room_detail: room.roomDetail,
      position_x: room.positionX,
      position_y: room.positionY,
      scale_x: room.scaleX,
      scale_y: room.scaleY,
    }));

    const { error } = await this.supabase.from('rooms').upsert(updates);

    if (error) {
      throw new Error(`Failed to update rooms: ${error.message}`);
    }
  }

  async findById(id: number): Promise<Room | null> {
    void id;
    return null;
  }
}