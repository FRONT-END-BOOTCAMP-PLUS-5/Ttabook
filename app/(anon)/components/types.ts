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
  spaceId: number;
  spaceName: string;
  roomInfo: Room[];
};

export interface RoomFurnitureProps {
  x: number;
  y: number;
  roomWidth: number;
  roomHeight: number;
}

export interface PersonIconProps {
  x: number;
  y: number;
  color?: string;
}
