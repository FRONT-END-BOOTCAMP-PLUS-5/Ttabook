import { RoomRepository } from '@/backend/common/domains/repositories/RoomRepository';
import { PutRoomQueryDto, RoomDto } from '../dtos/PutRoomQueryDto';
import { UpdateRequest } from '@/backend/common/domains/repositories/roomRequest';

export class PutRoomUsecase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomData: PutRoomQueryDto): Promise<void> {
    // roomData.token 처리
    const updateDatas = roomData.rooms.map((room: RoomDto) => {
      return new UpdateRequest(
        room.roomId,
        room.roomName,
        room.roomDetail,
        room.positionX,
        room.positionY,
        room.width,
        room.height
      );
    });
    this.roomRepository.upsert(updateDatas);
  }
}
