import { RoomRepository } from '@/backend/common/domains/repositories/RoomRepository';
import { PutRoomQueryDto, RoomDto } from '../dtos/PutRoomQueryDto';
import { SaveRequest } from '@/backend/common/domains/repositories/roomRequest';

export class PutRoomUsecase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomData: PutRoomQueryDto): Promise<void> {
    await this.roomRepository.deleteBySapaceId(roomData.spaceId);

    const updateDatas = roomData.rooms.map((room: RoomDto) => {
      return new SaveRequest(
        room.roomId,
        room.roomName,
        room.roomDetail,
        room.positionX,
        room.positionY,
        room.width,
        room.height
      );
    });
    this.roomRepository.saveAll(updateDatas);
  }
}
