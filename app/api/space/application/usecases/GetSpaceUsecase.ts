import { SpaceRepository } from '@/app/api/domain/repository/SpaceRepository';
import { GetSpaceDto } from '../dtos/GetSpaceDto';
import { RoomRepository } from '@/app/api/domain/repository/RoomRepository';

export class GetSpaceUsecase {
  constructor(
    private spaceRepository: SpaceRepository,
    private roomRepository: RoomRepository
  ) {
    this.spaceRepository = spaceRepository;
    this.roomRepository = roomRepository;
  }

  async execute(id: number): Promise<GetSpaceDto> {
    try {
      const space = await this.spaceRepository.findById(id);
      const rooms = await this.roomRepository.findBySpaceId(id);
      const roomInfos = rooms.map((room) => {
        return {
          id: room.id,
          name: room.name,
          detail: room.detail,
          positionX: room.positionX,
          positionY: room.positionY,
          scaleX: room.scaleX,
          scaleY: room.scaleY,
        };
      });
      return new GetSpaceDto(space.id, space.name, roomInfos);
    } catch (error) {
      console.error('Error fetching space:', error);
      throw new Error('Failed to fetch space');
    }
  }
}
