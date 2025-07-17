import { GetRsvListDto } from '../dtos/GetRsvListDto';
import { RsvRepository } from '@/backend/common/domains/repositories/RsvRepository';
import { Rsv } from '@/backend/common/domains/entities/Rsv';

export class GetRsvListUsecase {
  private repository: RsvRepository;
  constructor(repository: RsvRepository) {
    this.repository = repository;
  }

  async execute(): Promise<GetRsvListDto[]> {
    const rsvList: Rsv[] = await this.repository.findAll();
    return rsvList.map((rsv: Rsv) => {
      return new GetRsvListDto(
        rsv.room?.spaceId ?? 0,
        {
          roomId: rsv.roomId,
          roomName: rsv.room?.name ?? '',
        },
        {
          userId: rsv.userId,
        },
        {
          rsvId: rsv.id,
          startTime: new Date(rsv.startTime),
          endTime: new Date(rsv.endTime),
        }
      );
    });
  }
}
