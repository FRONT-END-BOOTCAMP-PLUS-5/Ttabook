import { Space } from '@/app/api/domain/entities/Space';
import { SpaceRepository } from '@/app/api/domain/repository/SpaceRepository';
import { GetSpaceDto } from '../application/dto/GetSpaceDto';

export class GetSpaceUsecase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(id: number): Promise<GetSpaceDto> {
    try {
      const space = await this.spaceRepository.findById(id);
      return new GetSpaceDto(space.id, space.name, space.rooms);
    } catch (error) {
      console.error('Error fetching space:', error);
      throw new Error('Failed to fetch space');
    }
  }
}
