import { RsvAdminView } from '../../domain/entities/RsvAdminView';
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
  private static mapToRsvAdminView(rsv: unknown): RsvAdminView {
    if (typeof rsv !== 'object' || rsv === null) {
      throw new Error('Invalid reservation data');
    }

    const { space_id, room_id, user_id, id, start_time, end_time, room } =
      rsv as any;

    if (
      typeof space_id !== 'number' ||
      typeof room_id !== 'number' ||
      typeof user_id !== 'string' ||
      typeof id !== 'string' ||
      !(start_time instanceof Date) ||
      !(end_time instanceof Date) ||
      typeof room !== 'object' ||
      room === null ||
      typeof room.name !== 'string'
    ) {
      throw new Error('Invalid reservation data');
    }

    return new RsvAdminView(
      space_id,
      user_id,
      room_id,
      room.name,
      id,
      start_time,
      end_time
    );
  }

  async findAll(): Promise<RsvAdminView[]> {
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
    ).map((rsv) => SbRsvRepository.mapToRsvAdminView(rsv));
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