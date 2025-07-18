'use client';

import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import styles from './EditRoomPage.module.css';
import Canvas from './Canvas';
import { RoomDto } from './types';

interface EditRoomPageProps {
  spaceId?: number;
  initialRooms?: RoomDto[];
  spaceName?: string;
}

const EditRoomPage: React.FC<EditRoomPageProps> = ({
  spaceId,
  initialRooms = [],
  spaceName = '공간 이름',
}) => {
  const [adminName, setAdminName] = useState<string>(spaceName);
  const [rooms, setRooms] = useState<RoomDto[]>(initialRooms);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingPos, setEditingPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'new-rect');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!stageRef.current) return;
    const stage = stageRef.current.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    const dropX = e.clientX - stageBox.left;
    const dropY = e.clientY - stageBox.top;

    const newRoom: RoomDto = {
      id: `new_${Date.now()}`, // DB에 없는 임시 ID
      positionX: dropX,
      positionY: dropY,
      width: 120,
      height: 100,
      name: '새로운 방',
      detail: '',
    };
    setRooms((prev) => [...prev, newRoom]);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleRectClick = (room: RoomDto) => setSelectedId(room.id);

  const handleDelete = (room: RoomDto) => {
    setRooms((prev) => prev.filter((r) => r.id !== room.id));
    setSelectedId(null);
  };

  const handleDragEnd = (room: RoomDto, node: Konva.Rect) => {
    const updatedRoom: RoomDto = {
      ...room,
      positionX: node.x(),
      positionY: node.y(),
    };
    setRooms((prev) => {
      const updatedRooms = prev.map((r) =>
        r.id === room.id ? updatedRoom : r
      );
      return updatedRooms;
    });
  };

  const handleTransformEnd = (room: RoomDto, node: Konva.Rect) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const updatedRoom: RoomDto = {
      ...room,
      positionX: node.x(),
      positionY: node.y(),
      width: Math.max(30, node.width() * scaleX),
      height: Math.max(30, node.height() * scaleY),
    };
    node.scaleX(1);
    node.scaleY(1);
    setRooms((prev) => {
      const updatedRooms = prev.map((r) =>
        r.id === room.id ? updatedRoom : r
      );
      return updatedRooms;
    });
  };

  const handleEditStart = (room: RoomDto) => {
    setEditingId(room.id);
    setEditingPos({ x: room.positionX, y: room.positionY });
  };

  const spaceSave = async () => {
    if (!spaceId) {
      alert('공간 정보가 올바르지 않아 저장할 수 없습니다.');
      console.error('spaceSave error: spaceId is missing.');
      return;
    }

    try {
      const response = await fetch(`/api/admin/spaces/${spaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'temp-token', // TODO: 실제 인증 로직으로 교체
        },
        body: JSON.stringify({
          spaceName: adminName,
          rooms: rooms.map((room) => ({
            roomId: typeof room.id === 'number' ? room.id : undefined,
            name: room.name ?? '이름 없음',
            detail: room.detail ?? '',
            positionX: room.positionX,
            positionY: room.positionY,
            width: room.width,
            height: room.height,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update space');
      }

      alert('저장되었습니다.');
      // 선택사항: 저장 후 페이지를 새로고침하여 서버 ID를 반영할 수 있습니다.
      // window.location.reload();
    } catch (error) {
      console.error('Error saving space:', error);
      alert(
        `저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer || !stageRef.current) return;
    const stage = stageRef.current.getStage();

    if (selectedId && !editingId) {
      const node = stage.findOne(`#${selectedId.toString()}`);
      if (node) {
        transformer.nodes([node]);
      } else {
        transformer.nodes([]);
      }
    } else {
      transformer.nodes([]);
    }
    transformer.getLayer()?.batchDraw();
  }, [selectedId, editingId, rooms]);

  return (
    <div className={styles.container}>
      <div className={styles.canvasContainer}>
        <input
          type="text"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          className={styles.titleInput}
        />
        {/* Canvas 컴포넌트에 필요한 props를 모두 전달합니다. */}
        <Canvas
          rooms={rooms}
          setRooms={setRooms}
          setSelectedId={setSelectedId}
          editingId={editingId}
          setEditingId={setEditingId}
          editingPos={editingPos}
          handleDrop={handleDrop}
          handleDragOver={handleDragOver}
          handleRectClick={handleRectClick}
          handleDragEnd={handleDragEnd}
          handleTransformEnd={handleTransformEnd}
          handleDelete={handleDelete}
          handleEditStart={handleEditStart}
          stageRef={stageRef}
          transformerRef={transformerRef}
        />
        <div
          draggable
          onDragStart={handleDragStart}
          className={styles.newRoomButton}
        >
          + Room
        </div>
      </div>
      <div>
        <button className={styles.saveButton} onClick={spaceSave}>
          저장
        </button>
      </div>
    </div>
  );
};

export default EditRoomPage;
