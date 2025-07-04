import { Rsv } from "../../domain/entities/Rsv";
import { RsvRoomSub } from "../../domain/entities/RsvRoomSub";
import { RsvUserView } from "../../domain/entities/RsvUserView";
import { RsvRepository } from "../../domain/repository/RsvRepository";
import { DeleteRequest, SaveRequest, UpdateRequest } from "../../domain/repository/rsvRequest";
import { SupabaseClient } from "@supabase/supabase-js";

export class SbRsvRepository implements RsvRepository{
  private supabase;
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }


  async findAll(): Promise<Rsv[]> {
    return [];
  }

  async findByUserId(id: string): Promise<RsvUserView[] | null> {
    return null;
  }

  async findByRoomId(spaceId: number, roomId: number): Promise<RsvRoomSub[]> {
    return [];
  }

  async save(reservation: SaveRequest): Promise<void> {
    
  }

  async update(reservation: UpdateRequest): Promise<void> {
    
  }

  async delete(reservation: DeleteRequest): Promise<void> {
    
  }
}