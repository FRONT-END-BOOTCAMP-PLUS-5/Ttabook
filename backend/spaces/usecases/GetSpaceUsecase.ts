import { SpaceRepository } from '@/backend/common/domains/repositories/SpaceRepository';
import { SpaceWithRoomsAndAssets } from '@/backend/common/domains/entities/Space';
import { GetSpaceDto } from '../dtos/GetSpaceDto';

export class GetSpaceUsecase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(id: number): Promise<GetSpaceDto> {
    try {
      const space = await this.spaceRepository.findById(id) as SpaceWithRoomsAndAssets;
      const rooms = space.rooms || [];
      return new GetSpaceDto(space.id, space.name, rooms);
    } catch (error) {
      console.error('Error fetching space:', error);
      throw new Error('Failed to fetch space');
    }
  }
}
