import { RoomRepository } from '@/backend/common/infrastructures/repositories/RoomRepository';

export class DeleteRoomUsecase {
  constructor(private roomRepository: RoomRepository) {}

  async execute(token: string, roomIds: number[]): Promise<void> {
    // TODO: Add authentication logic if necessary
    await this.roomRepository.deleteRooms(roomIds);
  }
}
