import { RoomRepository } from "@/app/api/domain/repository/RoomRepository";
import { PutRoomQueryDto, RoomDto } from "../dto/PutRoomQueryDto";
import { UpdateRequest } from "@/app/api/domain/repository/roomRequest";

export class PutRoomUsecase {
  private roomRepository: RoomRepository;

  constructor(roomRepository: RoomRepository) {
    this.roomRepository = roomRepository;
  }

  async execute(roomData: PutRoomQueryDto): Promise<void> {
    // roomData.token 처리
    const updateDatas = roomData.rooms.map((room: RoomDto) => {
      return new UpdateRequest(
        room.id,
        room.supplyId,
        room.roomName,
        room.roomDetail,
        room.positionX,
        room.positionY,
        room.scaleX,
        room.scaleY
      );
    });
    this.roomRepository.upsert(updateDatas);
  }
}