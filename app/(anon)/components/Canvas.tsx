'use client';

import React, { useRef } from 'react';
import { Stage, Layer, Rect, Text, Group, Label, Tag } from 'react-konva';
import Konva from 'konva';
import styles from './Canvas.module.css';
import { Room } from './types';

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 700;

const Canvas: React.FC = () => {
  // const [rooms, setRooms] = useState<Room[]>();
  const rooms: Room[] = [
    {
        id: 'room-1',
        x: 50,
        y: 60,
        width: 120,
        height: 100,
        name: '회의실 A',
        detail: '최대 8명 수용, 프로젝터 있음',
    },
    {
        id: 'room-2',
        x: 200,
        y: 80,
        width: 140,
        height: 110,
        name: '스터디룸 B',
        detail: '화이트보드 구비, 조용한 공간',
    },
    {
        id: 'room-3',
        x: 100,
        y: 220,
        width: 160,
        height: 130,
        name: '세미나실 C',
        detail: '대형 스크린, 최대 20명',
    },
    {
        id: 'room-4',
        x: 300,
        y: 250,
        width: 130,
        height: 100,
        name: '상담실 D',
        detail: '개인 상담용, 방음 시설 있음',
    },
    {
        id: 'room-5',
        x: 450,
        y: 180,
        width: 150,
        height: 120,
        name: '회의실 E',
        detail: '화상 회의 장비 완비',
    },
  ];
  
  const stageRef = useRef<Konva.Stage>(null);

  const handleOpenReservationModal = () => {
    alert(`해당 room의 예약 모달`);
  }

  const handleOpenInfoModal = (room : Room) => {
    alert(`${room.name}\n\n${room.detail || '상세 정보 없음'}`);
  }

  return (
    <div
      className={styles.canvasContainer}
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
      }}
    >

      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        ref={stageRef}
      >
        <Layer>
          {rooms.map((room) => (
            <Group
              key={room.id}
              id={room.id}
              x={room.x}
              y={room.y}
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
                  onClick={handleOpenReservationModal}
                  onMouseEnter={() => {
                    document.body.style.cursor = 'pointer';
                  }}
                  onMouseLeave={() => {
                    document.body.style.cursor = 'default';
                  }}
                />
                <Text
                  text={
                    (room.name || '이름 입력')
                  }
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
