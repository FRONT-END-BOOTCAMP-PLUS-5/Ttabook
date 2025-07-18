import Konva from 'konva';

export type Space = {
  spaceId: number;
  spaceName: string;
  roomInfo: RoomDto[];
};

export type RoomDto = {
  id: number | string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  name?: string;
  detail?: string;
};

export type incomingRooms = {
  spaceId: number;
  rooms: RoomDto[];
};

export type existingRooms = {
  spaceId: number;
  rooms: RoomDto[];
};

export interface CanvasProps {
  rooms: RoomDto[];
  setRooms: React.Dispatch<React.SetStateAction<RoomDto[]>>;
  setSelectedId: (id: string | number | null) => void;
  editingId: string | number | null;
  setEditingId: (id: string | number | null) => void;
  editingPos: { x: number; y: number };
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleRectClick: (room: RoomDto) => void;
  handleDragEnd: (room: RoomDto, node: Konva.Rect) => void;
  handleTransformEnd: (room: RoomDto, node: Konva.Rect) => void;
  handleDelete: (room: RoomDto) => void;
  handleEditStart: (room: RoomDto) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  transformerRef: React.RefObject<Konva.Transformer | null>;
}
