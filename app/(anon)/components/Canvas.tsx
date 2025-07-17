'use client';

import React, { useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Transformer,
  Group,
  Label,
  Tag,
} from 'react-konva';
import Konva from 'konva';
import styles from './Canvas.module.css';
import { Room } from './types';
import { useModalStore } from '@/hooks/useModal';
import RoomRsvModal from './modals/rooms/reservations/RoomRsvModal';
import RoomInfoModal from './modals/rooms/infos/RoomInfoModal';

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 700;

interface CanvasProps {
  rooms: Room[];
}

const Canvas: React.FC<CanvasProps> = ({ rooms }) => {
  const { isModalOpen, openModal, closeModal } = useModalStore();
  const [selectedRoom, setSelectedRoom] = useState<Room>();
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<Room>();
  const stageRef = useRef<Konva.Stage>(null);

  const handleOpenReservationModal = (room: Room) => {
    setSelectedRoom(room);
    openModal('room-rsv');
  };

  const handleOpenInfoModal = (room: Room) => {
    setSelectedRoomInfo(room);
    openModal('room-info');
  };

  return (
    <div
      className={styles.canvasContainer}
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
      }}
    >
      {isModalOpen('room-rsv') && selectedRoom && (
        <RoomRsvModal
          onClose={() => {
            closeModal('room-rsv');
          }}
          room={selectedRoom}
        />
      )}
      {isModalOpen('room-info') && selectedRoomInfo && (
        <RoomInfoModal
          onClose={() => {
            closeModal('room-info');
          }}
          room={selectedRoomInfo}
        />
      )}
      <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
        <Layer>
          {rooms?.map((room) => (
            <Group
              key={room.id}
              id={room.id}
              x={room.positionX}
              y={room.positionY}
              width={room.width}
              height={room.height}
            >
              <React.Fragment key={room.id}>
                <Rect
                  x={0}
                  y={0}
                  width={room.width}
                  height={room.height}
                  fill="#B8D4A8"
                  onClick={() => handleOpenReservationModal(room)}
                  onMouseEnter={() => {
                    document.body.style.cursor = 'pointer';
                  }}
                  onMouseLeave={() => {
                    document.body.style.cursor = 'default';
                  }}
                />
                <Text
                  text={room.name || '이름 입력'}
                  x={room.width * 0.03}
                  y={room.height * 0.06}
                  width={room.width * 0.92}
                  height={room.height * 0.92}
                  fontSize={room.height * 0.1}
                  fill="black"
                  lineHeight={1.0}
                  ellipsis={true}
                  listening={false}
                />
                <Label
                  x={room.width * 0.9}
                  y={room.height * 0.05}
                  onClick={() => {
                    handleOpenInfoModal(room);
                  }}
                >
                  <Tag fill="transparent" />
                  <Text
                    text="ⓘ"
                    fontSize={room.height * 0.09}
                    fill="black"
                    padding={0}
                    listening={true}
                    onMouseEnter={() => {
                      document.body.style.cursor = 'pointer';
                    }}
                    onMouseLeave={() => {
                      document.body.style.cursor = 'default';
                    }}
                  />
                </Label>
              </React.Fragment>
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
