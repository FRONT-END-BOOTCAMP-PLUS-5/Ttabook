import { RoomRepository } from '@/backend/common/domains/repositories/RoomRepository';
import { SaveRequest } from '@/backend/common/domains/repositories/roomRequest';
import { PostRoomQueryDto, RoomDto } from '../dtos/PostRoomQueryDto';

export class PostRoomUsecase {
  constructor(private repository: RoomRepository) {}

  async execute(roomData: PostRoomQueryDto): Promise<void> {
    // roomData.token 처리

    const saveRequests: SaveRequest[] = roomData.rooms.map((room: RoomDto) => {
      return new SaveRequest(
        room.spaceId,
        room.roomName,
        room.roomDetail,
        room.positionX,
        room.positionY,
        room.width,
        room.height
      );
    });

    return this.repository.saveAll(saveRequests);
  }
}
