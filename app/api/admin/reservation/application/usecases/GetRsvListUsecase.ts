import { GetRsvListDto } from '../dto/GetRsvListDto';
import { RsvRepository } from '../../../../domain/repository/RsvRepository';
import { Rsv } from '../../../../domain/entities/Rsv';

export class GetRsvListUsecase {
  private repository: RsvRepository;
  constructor(repository: RsvRepository) {
    this.repository = repository;
  }

  async execute(token: string): Promise<GetRsvListDto[]> {
    // Todo: token 관리자인지 확인 로직 필요
    void token;

    // if admin
    const rsvList: Rsv[] = await this.repository.findAll();
    return rsvList.map((rsv: Rsv) => {
      return new GetRsvListDto(
        rsv.spaceId,
        {
          roomId: rsv.roomId,
          roomName: rsv.room ? rsv.room.name : '',
        },
        {
          userId: rsv.userId,
        },
        {
          rsvId: rsv.id,
          startTime: rsv.startTime,
          endTime: rsv.endTime,
        }
      );
    });
  }
}