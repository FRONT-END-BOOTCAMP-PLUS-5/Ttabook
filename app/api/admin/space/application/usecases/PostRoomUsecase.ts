import { RoomRepository } from "@/app/api/domain/repository/RoomRepository";
import { SaveRequest } from "@/app/api/domain/repository/roomRequest";
import { PostRoomQueryDto, RoomDto } from "../dto/PostRoomQueryDto";


export class PostRoomUsecase {
  constructor(private repository: RoomRepository) {}

  async execute(roomData: PostRoomQueryDto): Promise<any> {
    // roomData.token 처리

    const saveRequests: SaveRequest[] = roomData.rooms.map((room: RoomDto) => {
      return {
        supplyId: room.supplyId,
        roomName: room.roomName,
        roomDetail: room.roomDetail,
        positionX: room.positionX,
        positionY: room.positionY,
        scaleX: room.scaleX,
        scaleY: room.scaleY
      } as SaveRequest;
    });
    return this.repository.saveAll(saveRequests);
  }
}