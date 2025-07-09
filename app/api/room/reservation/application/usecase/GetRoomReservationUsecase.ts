import { RsvRepository } from '@/app/api/domain/repository/RsvRepository';
import { GetRoomReservationDto } from '../dto/GetRoomReservationDto';

export class GetRoomReservationUsecase {
  constructor(private rsvRepository: RsvRepository) {}

  async execute(
    spaceId: number,
    roomId: number
  ): Promise<GetRoomReservationDto[]> {
    try {
      const reservations = await this.rsvRepository.findByRoomId(
        spaceId,
        roomId
      );
      return new GetRoomReservationDto(spaceId, roomId);
    } catch (error) {
      console.error('Error fetching room reservations:', error);
      throw new Error('Failed to fetch room reservations');
    }
  }
}
