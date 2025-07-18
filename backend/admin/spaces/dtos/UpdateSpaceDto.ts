export interface RoomData {
  roomId?: number; // 기존 방은 ID가 있음
  name: string;
  detail?: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

export interface UpdateSpaceBody {
  spaceName: string;
  rooms: RoomData[];
}
