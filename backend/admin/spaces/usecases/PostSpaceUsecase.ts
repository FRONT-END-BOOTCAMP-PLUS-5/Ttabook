import { SpaceRepository } from "@/backend/common/domains/repositories/SpaceRepository";
import { PostSpaceQueryDto } from "../dtos/PostSpaceQueryDto";
import { SaveRequest } from "@/backend/common/domains/repositories/spaceRequest";

export class PostSpaceUsecase {
  private repository: SpaceRepository;

  constructor(repository: SpaceRepository) {
    this.repository = repository;
  }

  async execute(spaceData: PostSpaceQueryDto): Promise<void> {
    // spaceData.token 처리

    const saveRequest: SaveRequest = {
      name: spaceData.spaceName,
    };
    await this.repository.save(saveRequest);
  }
}