import { Asset } from '../entities/Asset';

export interface AssetRepository {
  findAll(): Promise<Asset[]>;
  findByRoomId(roomId: number): Promise<Asset[]>;
  findById(id: number): Promise<Asset | null>;
  
  save(asset: Asset): Promise<void>;
  saveAll(assets: Asset[]): Promise<void>;
  update(asset: Asset): Promise<void>;
  delete(id: number): Promise<void>;
}