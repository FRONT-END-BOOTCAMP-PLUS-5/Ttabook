import { SupabaseClient } from '@supabase/supabase-js';
import { Room } from '../../domains/entities/Room';
import { Rsv } from '../../domains/entities/Rsv';
import { RsvRepository } from '../../domains/repositories/RsvRepository';
import { Space } from '../../domains/entities/Space';
import {
  DeleteRequest,
  SaveRequest,
  UpdateRequest,
} from '../../domains/repositories/rsvRequest';

export class SbRsvRepository implements RsvRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

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
    space?: {
      id?: number;
      name?: string;
      room?: Room[];
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
    const space = rsv.space
      ? new Space(
          rsv.space.id ? rsv.space.id : 0,
          rsv.space.name ? rsv.space.name : '',
          rsv.space.room ? rsv.space.room : []
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
      room,
      space
    );
  }

  async findAll(): Promise<Rsv[]> {
    const query = this.supabase.from('reservations').select(`
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

  async findByUserId(id: string): Promise<Rsv[] | null> {
    const query = this.supabase
      .from('reservations')
      .select(
        `
      id,
      user_id,
      space_id,
      space:space_id(name),
      room_id,
      room:room_id(name),
      start_time,
      end_time,
    `
      )
      .eq('user_id', id);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return (
      data as unknown as {
        id: string;
        user_id: string;
        space_id: number;
        room_id: number;
        start_time: Date;
        end_time: Date;
        space: { name: string };
        room: { name: string };
      }[]
    ).map((rsv) => SbRsvRepository.mapToRsv(rsv));
  }

  async findByRoomId(spaceId: number, roomId: number): Promise<Rsv[]> {
    const query = this.supabase
      .from('reservations')
      .select('*')
      .eq('space_id', spaceId)
      .eq('room_id', roomId);

    const { error, data } = await query;

    if (error) {
      throw new Error('SbRsvRepository.findByRoomId not implemented.');
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data;
  }

  async save(reservation: SaveRequest): Promise<void> {
    const query = this.supabase.from('reservations').insert([reservation]);

    const { error } = await query;

    if (error) {
      throw new Error(`Error saving reservation: ${error.message}`);
    }
  }

  async update(reservation: UpdateRequest): Promise<void> {
    const query = this.supabase
      .from('reservations')
      .update({
        start_time: reservation.startTime,
        end_time: reservation.endTime,
      })
      .eq('id', reservation.rsvId)
      .eq('user_id', reservation.userId);

    const { error } = await query;

    if (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }
  }

  async delete(reservation: DeleteRequest): Promise<void> {
    const query = this.supabase
      .from('reservations')
      .delete()
      .eq('id', reservation.rsvId)
      .eq('user_id', reservation.userId);

    const { error } = await query;

    if (error) {
      throw new Error(`Error deleting reservation: ${error.message}`);
    }
  }
}
