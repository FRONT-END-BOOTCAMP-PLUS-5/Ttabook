import { SpaceRepository } from "@/app/api/domain/repository/SpaceRepository";
import { PutSpaceQueryDto } from "../dto/PutSpaceQueryDto";


export class PutSpaceUsecase {
  private spaceRepository: SpaceRepository;

  constructor(spaceRepository: SpaceRepository) {
    this.spaceRepository = spaceRepository;
  }

  async execute(spaceData: PutSpaceQueryDto): Promise<void> {
    // spaceData.token 처리
    await this.spaceRepository.update({id: spaceData.spaceId, name: spaceData.spaceName});
  }
}