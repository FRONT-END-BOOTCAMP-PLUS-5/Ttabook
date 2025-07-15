import { RsvRepository } from '@/backend/common/domains/repositories/RsvRepository';
import { GetRoomReservationDto } from '../dtos/GetRoomRsvDto';

export class GetRoomRsvUsecase {
  constructor(private rsvRepository: RsvRepository) {
    this.rsvRepository = rsvRepository;
  }

  async execute(
    roomId: number
  ): Promise<GetRoomReservationDto[]> {
    try {
      const reservations = await this.rsvRepository.findByRoomId(
        roomId
      );

      return reservations.map((rsv) => {
        return new GetRoomReservationDto(rsv.startTime, rsv.endTime);
      });
    } catch (error) {
      console.error('Error fetching room reservations:', error);
      throw new Error('Failed to fetch room reservations');
    }
  }
}
