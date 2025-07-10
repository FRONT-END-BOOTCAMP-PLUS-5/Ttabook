import { RoomRepository } from "@/backend/common/domain/repository/RoomRepository";
import { SaveRequest } from "@/backend/common/domain/repository/roomRequest";
import { PostRoomQueryDto, RoomDto } from "../dtos/PostRoomQueryDto";


export class PostRoomUsecase {
  constructor(private repository: RoomRepository) {}

  async execute(roomData: PostRoomQueryDto): Promise<void> {
    // roomData.token 처리

    const saveRequests: SaveRequest[] = roomData.rooms.map((room: RoomDto) => {
      return new SaveRequest(
        room.supplyId,
        room.roomName,
        room.roomDetail,
        room.positionX,
        room.positionY,
        room.scaleX,
        room.scaleY
       )
    });
    return this.repository.saveAll(saveRequests);
  }
}