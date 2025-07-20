import { Rsv } from '@/backend/common/domains/entities/Rsv';
import { RsvRepository } from '@/backend/common/domains/repositories/RsvRepository';
import { GetUserRsvDto } from '../dtos/GetUserRsvDto';

export class GetUserRsvUsecase {
  private repository: RsvRepository;

  constructor(repository: RsvRepository) {
    this.repository = repository;
  }

  async execute(userId: string): Promise<GetUserRsvDto[]> {
    const reservations: Rsv[] | null =
      await this.repository.findByUserId(userId);

    // HACK: 나중에 공간 시간 관리 할 수 있는 기능 만들면 반드시 수정할 것
    const RESERVATION_START_TIME = 9;
    const RESERVATION_END_TIME = 18;

    if (!reservations) {
      return [];
    }

    const reservationStatus = reservations.map((e) => {
      const dto = new GetUserRsvDto(
        e.id,
        e.room?.spaceId ?? 0,
        e.space?.name ?? '',
        e.roomId,
        e.room?.name ?? '',
        e.createdAt ? new Date(e.createdAt).toLocaleTimeString() : "-",
        e.editedAt ? new Date(e.editedAt).toLocaleTimeString() : null,
        new Array(RESERVATION_END_TIME - RESERVATION_START_TIME).fill(0)
      );
      for (
        let i = new Date(e.startTime).getUTCHours() - RESERVATION_START_TIME;
        i <= new Date(e.endTime).getUTCHours() - RESERVATION_START_TIME;
        i++
      )
        dto.schedule[i] = 1;
      return dto;
    });

    return reservationStatus;
  }
}
