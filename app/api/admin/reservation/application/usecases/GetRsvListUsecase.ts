import { GetRsvListDto } from '../dto/GetRsvListDto';
import { RsvRepository } from '../../../../domain/repository/RsvRepository';
import { RsvAdminView } from '../../../../domain/entities/RsvAdminView';

export class GetRsvListUsecase {
  private repository: RsvRepository;
  constructor(repository: RsvRepository) {
    this.repository = repository;
  }

  async execute(token: string): Promise<GetRsvListDto[]> {
    // Todo: token 관리자인지 확인 로직 필요

    // if admin
    const rsvList: RsvAdminView[] = await this.repository.findAll();
    return rsvList.map((rsv: RsvAdminView) => {
      return new GetRsvListDto(
        rsv.spaceId,
        {
          roomId: rsv.roomId,
          roomName: rsv.roomName,
        },
        {
          userId: rsv.userId,
        },
        {
          rsvId: rsv.rsvId,
          startTime: rsv.startTime,
          endTime: rsv.endTime,
        }
      );
    });
  }
}