import { Rsv } from '@/app/api/domain/entities/Rsv';
import { RsvRepository } from '@/app/api/domain/repository/RsvRepository';

export class GetUserRsvUsecase {
  private repository: RsvRepository;
  constructor(repository: RsvRepository) {
    this.repository = repository;
  }

  async execute(userId: string) {
    const reservations: Rsv[] | null =
      await this.repository.findByUserId(userId);

    // HACK: 나중에 공간 시간 관리 할 수 있는 기능 만들면 반드시 수정할 것
    const RESERVATION_START_TIME = 9;
    const RESERVATION_END_TIME = 18;

    const reservationStatus: number[] = new Array(
      RESERVATION_END_TIME - RESERVATION_START_TIME
    ).fill(0);

    if (!reservations) {
      return reservationStatus;
    }

    reservations.forEach((e) => {
      for (
        let i = e.startTime.getHours() - RESERVATION_START_TIME;
        i <= e.endTime.getHours() - RESERVATION_START_TIME;
        i++
      )
        reservationStatus[i] = 1;
    });

    return reservationStatus;
  }
}
