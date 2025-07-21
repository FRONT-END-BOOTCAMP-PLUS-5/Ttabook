import { SupabaseClient } from '@supabase/supabase-js';
import { Rsv } from '../../domains/entities/Rsv';
import { RsvRepository } from '../../domains/repositories/RsvRepository';
import {
  DeleteRequest,
  SaveRequest,
  UpdateRequest,
} from '../../domains/repositories/rsvRequest';
import {
  mapKeysToCamelCase,
  mapKeysToSnakeCase,
} from '../utils/CaseConvertUtils';

export class SbRsvRepository implements RsvRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findAll(): Promise<Rsv[]> {
    const query = this.supabase.from('reservations').select(`
      user_id,
      room_id,
      id,
      start_time,
      end_time,
      user:user_id (
        name,
        email
      ),
      room:room_id (
        name,
        space_id,
        space:space_id (
          name
        )
      )
    `);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching reservations: ${error.message}`);
    }

    return mapKeysToCamelCase(data) as Rsv[];
  }

  async findByUserId(id: string): Promise<Rsv[] | null> {
    const query = this.supabase
      .from('reservations')
      .select(
        `
      id,
      user_id,
      room_id,
      start_time,
      end_time,
      created_at,
      edited_at,
      room:room_id(
        name,
        space_id,
        space:space_id(name)
      )
        `
      )
      .eq('user_id', id);

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return mapKeysToCamelCase(data) as Rsv[];
  }

  async findByRoomId(roomId: number): Promise<Rsv[]> {
    const query = this.supabase
      .from('reservations')
      .select('*')
      .eq('room_id', roomId);

    const { error, data } = await query;

    if (error) {
      throw new Error('SbRsvRepository.findByRoomId not implemented.');
    }

    if (!data || data.length === 0) {
      return [];
    }

    return mapKeysToCamelCase(data) as Rsv[];
  }

  async save(reservation: SaveRequest): Promise<void> {
    const query = this.supabase
      .from('reservations')
      .insert(mapKeysToSnakeCase(reservation));

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
