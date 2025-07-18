import { RsvRepository } from '@/backend/common/domains/repositories/RsvRepository';
import { GetRoomReservationDto } from '../dtos/GetRoomRsvDto';

export class GetRoomRsvUsecase {
  constructor(private rsvRepository: RsvRepository) {
    this.rsvRepository = rsvRepository;
  }

  async execute(roomId: number): Promise<GetRoomReservationDto> {
    try {
      const reservations = await this.rsvRepository.findByRoomId(roomId);

      // HACK: 나중에 공간 시간 관리 할 수 있는 기능 만들면 반드시 수정할 것
      const RESERVATION_START_TIME = 9;
      const RESERVATION_END_TIME = 18;

      const reservationStatus = new GetRoomReservationDto(new Array(
        RESERVATION_END_TIME - RESERVATION_START_TIME
      ).fill(0));

      if (!reservations) {
        return reservationStatus;
      }

      reservations.forEach((e) => {
        for (
          let i = new Date(e.startTime).getUTCHours() - RESERVATION_START_TIME;
          i <= new Date(e.endTime).getUTCHours() - RESERVATION_START_TIME;
          i++
        )
          reservationStatus.schedule[i] = 1;
      });

      return reservationStatus;
    } catch (error) {
      console.error('Error fetching room reservations:', error);
      throw new Error('Failed to fetch room reservations');
    }
  }
}
