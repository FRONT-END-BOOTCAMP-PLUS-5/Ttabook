import { RoomRepository } from "@/app/api/domain/repository/RoomRepository";
import { PutRoomQueryDto } from "../dto/PutRoomQueryDto";
import { RoomDto } from "../dto/RoomDto";
import { UpdateRequest } from "@/app/api/domain/repository/roomRequest";

export class PutRoomUsecase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomData: PutRoomQueryDto): Promise<any> {
    // roomData.token 처리
    roomData.rooms.forEach((room: RoomDto) => {
      const updateData = new UpdateRequest(
        room.id,
        room.supplyId,
        room.roomName,
        room.roomDetail,
        room.positionX,
        room.positionY,
        room.scaleX,
        room.scaleY
      );
      this.roomRepository.update(updateData);
    })
  }
}