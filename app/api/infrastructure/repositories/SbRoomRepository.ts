import { RoomRepository } from '@/app/api/domain/repository/RoomRepository';
import { Room } from '../../domain/entities/Room';
import { supabaseAdmin as supabase } from '../supabase/client';
import { SaveRequest } from '../../domain/repository/roomRequest';

export class SbRoomRepository implements RoomRepository {
  async save(room: SaveRequest): Promise<void> {
    await supabase.from('room').insert({
      supply_id: room.supplyId,
      room_name: room.roomName,
      room_detail: room.roomDetail,
      position_x: room.positionX,
      position_y: room.positionY,
      scale_x: room.scaleX,
      scale_y: room.scaleY,
    });
  }
  async update(room: Room): Promise<void> {
    
  }
  async findById(id: number): Promise<Room | null> {
    
    return null;
  }
}