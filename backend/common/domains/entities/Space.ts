import { Room } from './Room';
import { Asset } from './Asset';

export interface SpaceWithRoomsAndAssets {
  id: number;
  name: string;
  rooms: (Room & { assets: Asset[] })[];
}

export class Space {
  constructor(
    public id: number,
    public name: string,
    public rooms: Room[]
  ) {}
}
