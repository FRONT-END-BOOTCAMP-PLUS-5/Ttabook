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
    throw new Error("SbRsvRepository.findAll not implemented.");
  }

  async findByUserId(id: string): Promise<RsvUserView[] | null> {
    void id;
    throw new Error("SbRsvRepository.findByUserId not implemented.");
  }

  async findByRoomId(spaceId: number, roomId: number): Promise<RsvRoomSub[]> {
    void spaceId
    void roomId;
    throw new Error("SbRsvRepository.findByRoomId not implemented.");
  }

  async save(reservation: SaveRequest): Promise<void> {
    void reservation;
    throw new Error("SbRsvRepository.save not implemented.");
  }

  async update(reservation: UpdateRequest): Promise<void> {
    void reservation;
    throw new Error("SbRsvRepository.update not implemented.");
  }

  async delete(reservation: DeleteRequest): Promise<void> {
    void reservation;
    throw new Error("SbRsvRepository.delete not implemented.");
  }
}