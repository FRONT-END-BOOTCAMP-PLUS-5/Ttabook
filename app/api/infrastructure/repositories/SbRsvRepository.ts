import { Room } from '../../domain/entities/Room';
import { Rsv } from '../../domain/entities/Rsv';
import { RsvRoomSub } from '../../domain/entities/RsvRoomSub';
import { RsvUserView } from '../../domain/entities/RsvUserView';
import { RsvRepository } from '../../domain/repository/RsvRepository';
import {
  DeleteRequest,
  SaveRequest,
  UpdateRequest,
} from '../../domain/repository/rsvRequest';
import { supabaseAdmin as supabase } from '@/app/api/infrastructure/supabase/client';

export class SbRsvRepository implements RsvRepository {
  private static mapToRsv(rsv: {
    space_id: number;
    room_id: number;
    user_id: string;
    id: string;
    start_time: Date;
    end_time: Date;
    created_at?: Date;
    edited_at?: Date;
    deleted_at?: Date | null;
    room?: {
      id?: number;
      supply_id?: number;
      name?: string;
      detail?: string;
      roomItem_id?: number;
      space_id?: number;
      position_x?: number;
      position_y?: number;
      scale_x?: number;
      scale_y?: number;
    };
  }): Rsv {
    const createdAt = rsv.created_at ? rsv.created_at : null;
    const editedAt = rsv.edited_at ? rsv.edited_at : null;
    const deletedAt = rsv.deleted_at ? rsv.deleted_at : null;
    const room = rsv.room
      ? new Room(
          rsv.room.id ? rsv.room.id : 0,
          rsv.room.supply_id ? rsv.room.supply_id : 0,
          rsv.room.name ? rsv.room.name : '',
          rsv.room.detail ? rsv.room.detail : null,
          rsv.room.roomItem_id ? rsv.room.roomItem_id : 0,
          rsv.space_id,
          rsv.room.position_x ? rsv.room.position_x : 0,
          rsv.room.position_y ? rsv.room.position_y : 0,
          rsv.room.scale_x ? rsv.room.scale_x : 1,
          rsv.room.scale_y ? rsv.room.scale_y : 1
        )
      : null;

    return new Rsv(
      rsv.id,
      rsv.user_id,
      rsv.space_id,
      rsv.room_id,
      rsv.start_time,
      rsv.end_time,
      createdAt,
      editedAt,
      deletedAt,
      room
    );
  }

  async findAll(): Promise<Rsv[]> {
    const query = supabase.from('reservation').select(`
      user_id,
      room_id,
      space_id,
      id,
      start_time,
      end_time,
      room:room_id (
        name
      )
    `);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching reservations: ${error.message}`);
    }

    return (
      data as unknown as {
        user_id: string;
        room_id: number;
        space_id: number;
        id: string;
        start_time: Date;
        end_time: Date;
        room: {
          name: string;
        };
      }[]
    ).map((rsv) => SbRsvRepository.mapToRsv(rsv));
  }

  async findByUserId(id: string): Promise<RsvUserView[] | null> {
    return null;
  }

  async findByRoomId(spaceId: number, roomId: number): Promise<RsvRoomSub[]> {
    return [];
  }

  async save(reservation: SaveRequest): Promise<void> {}

  async update(reservation: UpdateRequest): Promise<void> {}

  async delete(reservation: DeleteRequest): Promise<void> {}
}