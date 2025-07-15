import Konva from 'konva';

export type Room = {
  id: number | string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  name?: string;
  detail?: string;
};

export interface CanvasProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setSelectedId: (id: string | number | null) => void;
  editingId: string | number | null;
  setEditingId: (id: string | number | null) => void;
  editingPos: { x: number; y: number };
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleRectClick: (room: Room) => void;
  handleDragEnd: (id: string, x: number, y: number) => void;
  handleTransformEnd: (room: Room, node: Konva.Rect) => void;
  handleDelete: (room: Room) => void;
  handleEditStart: (room: Room) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  transformerRef: React.RefObject<Konva.Transformer | null>;
}
