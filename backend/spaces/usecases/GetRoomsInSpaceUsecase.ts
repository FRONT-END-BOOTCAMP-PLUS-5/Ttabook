import { Room } from '@/backend/common/domains/entities/Room';
import { RoomRepository } from '@/backend/common/domains/repositories/RoomRepository';

export class GetRoomsInSpaceUsecase {
  constructor(private roomRepository: RoomRepository) {}

  async execute(id: number): Promise<Room[]> {
    const roomAndAssets = await this.roomRepository.findBySpaceId(id);
    return roomAndAssets ? roomAndAssets : [];
  }
}
