'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import Konva from 'konva';

const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 700;

type Room = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // rotation?: number;
};

const CreateRoomCanvas: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'new-rect');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const stage = stageRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();

    const dropX = e.clientX - stageBox.left;
    const dropY = e.clientY - stageBox.top;

    const newRoom: Room = {
      id: Date.now().toString(),
      x: dropX,
      y: dropY,
      width: 120,
      height: 100,
      // rotation: 0,
    };

    setRooms((prev) => [...prev, newRoom]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRectClick = (room: Room) => {
    setSelectedId(room.id);
    setSelectedPosition({ x: room.x, y: room.y });
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    setRooms((prev) =>
      prev.map((room) => (room.id === id ? { ...room, x, y } : room))
    );

    if (id === selectedId) {
      setSelectedPosition({ x, y });
    }
  };

  const handleTransformEnd = (room: Room, node: Konva.Rect) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const updatedRoom: Room = {
      ...room,
      x: node.x(),
      y: node.y(),
      width: Math.max(30, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
      // rotation: node.rotation(),
    };

    node.scaleX(1);
    node.scaleY(1);

    setRooms((prev) => prev.map((r) => (r.id === room.id ? updatedRoom : r)));

    if (room.id === selectedId) {
      setSelectedPosition({ x: updatedRoom.x, y: updatedRoom.y });
    }
  };

  useEffect(() => {
    if (transformerRef.current && selectedId) {
      const stage = stageRef.current.getStage();
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId, rooms]);

  const handleDelete = () => {
    if (selectedId) {
      // 삭제
      setRooms((prev) => prev.filter((r) => r.id !== selectedId));
      setSelectedId(null);
      setSelectedPosition(null);

      // Transformer 초기화
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* 생성 버튼 */}
      <div
        draggable
        onDragStart={handleDragStart}
        style={{
          width: 120,
          height: 100,
          backgroundColor: 'lightblue',
          border: '2px solid #0077cc',
          borderRadius: 4,
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          userSelect: 'none',
        }}
      >
        + 생성
      </div>

      {/* Canvas + 삭제버튼 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          position: 'relative',
          border: '2px dashed #ccc',
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
        }}
      >
        {/* 삭제 버튼 (선택된 Rect가 있을 때만 표시) */}
        {selectedPosition && (
          <div
            style={{
              position: 'absolute',
              top: selectedPosition.y - 10,
              left: selectedPosition.x + 120 - 10,
              zIndex: 10, // 캔버스 위로 올라오게
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'red',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Konva Stage */}
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} ref={stageRef}>
          <Layer>
            {rooms.map((room) => (
              <Rect
                key={room.id}
                id={room.id}
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                // rotation={room.rotation}
                fill="lightblue"
                draggable
                onClick={() => handleRectClick(room)}
                onDragEnd={(e) =>
                  handleDragEnd(room.id, e.target.x(), e.target.y())
                }
                onTransformEnd={(e) =>
                  handleTransformEnd(room, e.target as Konva.Rect)
                }
              />
            ))}
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 30 || newBox.height < 30) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CreateRoomCanvas;
