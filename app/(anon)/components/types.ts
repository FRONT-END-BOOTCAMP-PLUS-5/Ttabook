export type Room = {
  id: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  name?: string;
  detail?: string;
};

export type Space = {
  spaceId: Number;
  spaceName: string;
  roomInfo: Room[];
}