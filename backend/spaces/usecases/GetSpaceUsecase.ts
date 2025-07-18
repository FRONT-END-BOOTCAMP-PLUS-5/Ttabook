import { SpaceRepository } from '@/backend/common/domains/repositories/SpaceRepository';
import { Space } from '@/backend/common/domains/entities/Space';

export class GetSpaceUsecase {
  constructor(private spaceRepository: SpaceRepository) {}

  async execute(id: number): Promise<Space> {
    const space = await this.spaceRepository.findById(id);

    return space as Space;
  }
}
