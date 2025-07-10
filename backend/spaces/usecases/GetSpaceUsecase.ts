import { SpaceRepository } from '@/backend/common/domain/repository/SpaceRepository';
import { GetSpaceDto } from '../dtos/GetSpaceDto';

export class GetSpaceUsecase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(id: number): Promise<GetSpaceDto> {
    try {
      const space = await this.spaceRepository.findById(id);
      return new GetSpaceDto(space.id, space.name, space.room);
    } catch (error) {
      console.error('Error fetching space:', error);
      throw new Error('Failed to fetch space');
    }
  }
}
