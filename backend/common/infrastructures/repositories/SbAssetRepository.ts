import { SupabaseClient } from '@supabase/supabase-js';
import { Asset } from '../../domains/entities/Asset';
import { AssetRepository } from '../../domains/repositories/AssetRepository';

export class SbAssetRepository implements AssetRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findAll(): Promise<Asset[]> {
    const { data, error } = await this.supabase.from('assets').select('*');

    if (error) {
      throw new Error(`Error fetching assets: ${error.message}`);
    }

    return data.map(
      (row) =>
        new Asset(
          row.id,
          row.room_id,
          row.type,
          row.position_x,
          row.position_y,
          row.width,
          row.height
        )
    );
  }

  async findByRoomId(roomId: number): Promise<Asset[]> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      throw new Error(
        `Error fetching assets for room ${roomId}: ${error.message}`
      );
    }

    return data.map(
      (row) =>
        new Asset(
          row.id,
          row.room_id,
          row.type,
          row.position_x,
          row.position_y,
          row.width,
          row.height
        )
    );
  }

  async findById(id: number): Promise<Asset | null> {
    const { data, error } = await this.supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      throw new Error(`Error fetching asset ${id}: ${error.message}`);
    }

    return new Asset(
      data.id,
      data.room_id,
      data.type,
      data.position_x,
      data.position_y,
      data.width,
      data.height
    );
  }

  async save(asset: Asset): Promise<void> {
    const { error } = await this.supabase.from('assets').insert({
      room_id: asset.roomId,
      type: asset.type,
      position_x: asset.positionX,
      position_y: asset.positionY,
      width: asset.width,
      height: asset.height,
    });

    if (error) {
      throw new Error(`Error saving asset: ${error.message}`);
    }
  }

  async saveAll(assets: Asset[]): Promise<void> {
    const insertData = assets.map((asset) => ({
      room_id: asset.roomId,
      type: asset.type,
      position_x: asset.positionX,
      position_y: asset.positionY,
      width: asset.width,
      height: asset.height,
    }));

    const { error } = await this.supabase.from('assets').insert(insertData);

    if (error) {
      throw new Error(`Error saving assets: ${error.message}`);
    }
  }

  async update(asset: Asset): Promise<void> {
    const { error } = await this.supabase
      .from('assets')
      .update({
        room_id: asset.roomId,
        type: asset.type,
        position_x: asset.positionX,
        position_y: asset.positionY,
        width: asset.width,
        height: asset.height,
      })
      .eq('id', asset.id);

    if (error) {
      throw new Error(`Error updating asset ${asset.id}: ${error.message}`);
    }
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.supabase.from('assets').delete().eq('id', id);

    if (error) {
      throw new Error(`Error deleting asset ${id}: ${error.message}`);
    }
  }
}
