import { Room } from '@/backend/common/domains/entities/Room';

export class GetSpaceDto {
  constructor(
    public spaceId: number,
    public spaceName: string,
    public roomInfo: Room[]
  ) {}
}
