import { SpaceRepository } from "@/app/api/domain/repository/SpaceRepository";
import { PostSpaceQueryDto } from "../dto/PostSpaceQueryDto";
import { SaveRequest } from "@/app/api/domain/repository/spaceRequest";

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